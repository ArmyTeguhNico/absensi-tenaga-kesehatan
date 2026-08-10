// Load environment variables (optional in Netlify - env vars are injected)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const { createClient } = require('@supabase/supabase-js');

// TEMPORARY: Hardcoded credentials for testing
// TODO: Move back to environment variables after Netlify env vars issue is resolved
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://schzdduftqwlsbajedzx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaHpkZHVmdHF3bHNiYWplZHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjMxMTQwMiwiZXhwIjoyMTAxODg3NDAyfQ.3uAf0lA7WT7gNeIwqedPySGLSlAKwBGnXWuyAMMTIQ8';

// Log environment status for debugging
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: SUPABASE_URL ? 'SET' : 'MISSING',
  SUPABASE_SERVICE_KEY: SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING'
});

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  throw new Error('Missing Supabase credentials');
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
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
