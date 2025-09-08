import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
