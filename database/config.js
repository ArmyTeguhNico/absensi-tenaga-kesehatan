require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
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

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.error('❌ Supabase connection error:', error.message);
    } else {
      console.log('✓ Supabase connected successfully');
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
  }
}

testConnection();

module.exports = supabase;
