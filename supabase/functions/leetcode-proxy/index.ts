import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const LEETCODE_API_BASE = Deno.env.get('LEETCODE_API_BASE_URL')!

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.pathname.replace('/leetcode-proxy', '')
    const queryParams = url.search

    // Validate that user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Proxy the request to your LeetCode API
    const leetcodeUrl = `${LEETCODE_API_BASE}${endpoint}${queryParams}`
    
    const response = await fetch(leetcodeUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TechConnect-Proxy',
      },
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})