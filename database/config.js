// Load environment variables (optional in Netlify - env vars are injected)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
  throw new Error('Missing Supabase credentials');
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test connection (only log, don't fail)
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.log('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✓ Supabase connected successfully');
    }
  } catch (error) {
    console.log('⚠️  Supabase connection test failed:', error.message);
  }
}

// Run test in background, don't wait
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

module.exports = supabase;
