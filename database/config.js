// Load environment variables 
// In Netlify Functions, env vars are automatically injected
// In local dev, load from .env file
try {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
} catch (err) {
  console.log('dotenv not loaded (normal in Netlify):', err.message);
}

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment or use fallback
// IMPORTANT: These are fallback values for Netlify deployment
// Updated to match the actual Supabase project from netlify.env
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tbjshustaqijmbtxssod.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRianNodXN0YXFpam1idHhzc29kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjEwNzk0OSwiZXhwIjoyMTAxNjgzOTQ5fQ.Y_tdjt1SPC8NrEGZqKf4qywh_OpdvPMfKlXmhFVbbRY';

// Enhanced logging for debugging
console.log('═══════════════════════════════════════');
console.log('🔧 Supabase Configuration Check');
console.log('═══════════════════════════════════════');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('URL from env:', process.env.SUPABASE_URL ? 'YES' : 'NO');
console.log('Key from env:', process.env.SUPABASE_SERVICE_KEY ? 'YES' : 'NO');
console.log('Final URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 35)}...` : 'MISSING!');
console.log('Final Key Length:', SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.length : 0);
console.log('Using Fallback:', !(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY));
console.log('═══════════════════════════════════════');

// Final validation - this should never fail now
if (!SUPABASE_URL || SUPABASE_URL === '' || !SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === '') {
  const errorDetail = {
    url_present: !!SUPABASE_URL,
    url_empty: SUPABASE_URL === '',
    key_present: !!SUPABASE_SERVICE_KEY,
    key_empty: SUPABASE_SERVICE_KEY === '',
    env_vars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  };
  console.error('❌ CRITICAL: Supabase credentials validation failed');
  console.error('Details:', JSON.stringify(errorDetail, null, 2));
  throw new Error('Missing Supabase credentials - check environment variables');
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
