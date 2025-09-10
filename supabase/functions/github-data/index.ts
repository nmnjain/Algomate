import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper functions for streak calculations
function calculateCurrentStreak(activityData: any[]): number {
  let streak = 0
  // Start from the most recent day and work backwards
  for (let i = activityData.length - 1; i >= 0; i--) {
    if (activityData[i].count > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function calculateLongestStreak(activityData: any[]): number {
  let maxStreak = 0
  let currentStreak = 0
  
  activityData.forEach(day => {
    if (day.count > 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  
  return maxStreak
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the auth header
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the GitHub OAuth token for this user
    const { data: identities, error: identityError } = await supabaseClient
      .from('auth.identities')
      .select('identity_data')
      .eq('user_id', user.id)
      .eq('provider', 'github')
      .single()

    if (identityError || !identities) {
      return new Response(JSON.stringify({ error: 'GitHub not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const githubToken = identities.identity_data.provider_token

    // Fetch GitHub data
    const githubUsername = identities.identity_data.user_name
    
    // Fetch user profile
    const profileResponse = await fetch(`https://api.github.com/user`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    const profile = await profileResponse.json()

    // Fetch repositories
    const reposResponse = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=10`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    const repos = await reposResponse.json()

    // Fetch user events for activity heatmap
    const eventsResponse = await fetch(`https://api.github.com/users/${githubUsername}/events?per_page=100`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    const events = await eventsResponse.json()

    // Process events for heatmap data
    const activityMap = new Map()
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    // Initialize activity map for the past year
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      activityMap.set(dateKey, 0)
    }

    // Count activities by date
    if (Array.isArray(events)) {
      events.forEach((event: any) => {
        const eventDate = new Date(event.created_at)
        if (eventDate >= oneYearAgo) {
          const dateKey = eventDate.toISOString().split('T')[0]
          if (activityMap.has(dateKey)) {
            activityMap.set(dateKey, activityMap.get(dateKey) + 1)
          }
        }
      })
    }

    // Convert activity map to array format for frontend
    const activityData = Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count,
      level: count === 0 ? 0 : count < 2 ? 1 : count < 5 ? 2 : count < 10 ? 3 : 4
    }))

    // Fetch contribution stats (simplified version)
    const contributionsResponse = await fetch(`https://api.github.com/search/commits?q=author:${githubUsername}&sort=author-date&per_page=1`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    const contributions = await contributionsResponse.json()

    // Calculate stats
    const totalRepos = profile.public_repos
    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
    const languages = repos.reduce((langs: any, repo: any) => {
      if (repo.language) {
        langs[repo.language] = (langs[repo.language] || 0) + 1
      }
      return langs
    }, {})

    const githubData = {
      profile: {
        login: profile.login,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      },
      stats: {
        totalRepos,
        totalStars,
        totalCommits: contributions.total_count || 0,
        topLanguages: Object.entries(languages)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 5),
      },
      recentRepos: repos.slice(0, 5).map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
      })),
      activityData: activityData,
      activitySummary: {
        totalDaysActive: activityData.filter(day => day.count > 0).length,
        maxDailyActivity: Math.max(...activityData.map(day => day.count)),
        avgDailyActivity: activityData.reduce((sum, day) => sum + day.count, 0) / activityData.length,
        currentStreak: calculateCurrentStreak(activityData),
        longestStreak: calculateLongestStreak(activityData),
      }
    }

    // Cache the data in our database
    const { error: cacheError } = await supabaseClient
      .from('user_platform_data')
      .upsert({
        user_id: user.id,
        platform: 'github',
        data: githubData,
        last_updated: new Date().toISOString(),
      })

    if (cacheError) {
      console.error('Error caching GitHub data:', cacheError)
    }

    return new Response(JSON.stringify(githubData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
