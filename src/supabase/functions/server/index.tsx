import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger(console.log))

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Health check
app.get('/make-server-e553588d/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Create user profile after signup
app.post('/make-server-e553588d/users/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      console.log('Authentication error during profile creation:', authError)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name, github_username, skills, bio } = await c.req.json()

    // Create or update user profile in key-value store
    const profileData = {
      user_id: user.id,
      email: user.email,
      name: name || user.user_metadata?.name,
      github_username: github_username || user.user_metadata?.user_name,
      skills: skills || [],
      bio: bio || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Store profile data
    const { error: kvError } = await supabase
      .from('kv_store_e553588d')
      .upsert([
        {
          key: `user_profile:${user.id}`,
          value: profileData
        }
      ])

    if (kvError) {
      console.log('Error creating user profile:', kvError)
      return c.json({ error: 'Failed to create profile' }, 500)
    }

    return c.json({ data: profileData })
  } catch (error) {
    console.log('Profile creation error:', error)
    return c.json({ error: 'Internal server error during profile creation' }, 500)
  }
})

// Get user profile
app.get('/make-server-e553588d/users/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      console.log('Authentication error during profile fetch:', authError)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get profile data from key-value store
    const { data, error } = await supabase
      .from('kv_store_e553588d')
      .select('value')
      .eq('key', `user_profile:${user.id}`)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.log('Error fetching user profile:', error)
      return c.json({ error: 'Failed to fetch profile' }, 500)
    }

    if (!data) {
      // Create default profile if none exists
      const defaultProfile = {
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        github_username: user.user_metadata?.user_name || '',
        skills: [],
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('kv_store_e553588d')
        .insert([
          {
            key: `user_profile:${user.id}`,
            value: defaultProfile
          }
        ])

      return c.json({ data: defaultProfile })
    }

    return c.json({ data: data.value })
  } catch (error) {
    console.log('Profile fetch error:', error)
    return c.json({ error: 'Internal server error during profile fetch' }, 500)
  }
})

// Initialize storage bucket
async function initializeBucket() {
  try {
    const bucketName = 'make-e553588d-resumes'
    
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (error) {
        console.log('Error creating bucket:', error)
      } else {
        console.log('Resume bucket created successfully')
      }
    }
  } catch (error) {
    console.log('Bucket initialization error:', error)
  }
}

// Initialize bucket on startup
initializeBucket()

// Handle resume uploads
app.post('/make-server-e553588d/upload/resume', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      console.log('Authentication error during resume upload:', authError)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const formData = await c.req.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-resume-${Date.now()}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('make-e553588d-resumes')
      .upload(fileName, file)

    if (error) {
      console.log('Resume upload error:', error)
      return c.json({ error: 'Failed to upload resume' }, 500)
    }

    // Create signed URL for private access
    const { data: urlData, error: urlError } = await supabase.storage
      .from('make-e553588d-resumes')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year

    if (urlError) {
      console.log('Signed URL creation error:', urlError)
      return c.json({ error: 'Failed to create access URL' }, 500)
    }

    // Update user profile with resume info
    const { data: profile } = await supabase
      .from('kv_store_e553588d')
      .select('value')
      .eq('key', `user_profile:${user.id}`)
      .single()

    if (profile) {
      const updatedProfile = {
        ...profile.value,
        resume_filename: fileName,
        resume_url: urlData.signedUrl,
        resume_uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('kv_store_e553588d')
        .update({ value: updatedProfile })
        .eq('key', `user_profile:${user.id}`)
    }

    return c.json({ 
      data: { 
        filename: fileName,
        url: urlData.signedUrl 
      } 
    })
  } catch (error) {
    console.log('Resume upload error:', error)
    return c.json({ error: 'Internal server error during resume upload' }, 500)
  }
})

// Get signed URL for resume download
app.get('/make-server-e553588d/resume/:filename', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      console.log('Authentication error during resume access:', authError)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const filename = c.req.param('filename')
    
    // Create signed URL
    const { data, error } = await supabase.storage
      .from('make-e553588d-resumes')
      .createSignedUrl(filename, 60 * 60) // 1 hour

    if (error) {
      console.log('Resume access error:', error)
      return c.json({ error: 'Failed to access resume' }, 500)
    }

    return c.json({ data: { url: data.signedUrl } })
  } catch (error) {
    console.log('Resume access error:', error)
    return c.json({ error: 'Internal server error during resume access' }, 500)
  }
})

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

Deno.serve(app.fetch)