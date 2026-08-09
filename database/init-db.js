require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting Supabase database initialization...\n');

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin')
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking admin: ${checkError.message}`);
    }

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email:', existingAdmin[0].email);
      console.log('\n⚠️  To reset database, please:');
      console.log('   1. Go to Supabase Dashboard');
      console.log('   2. Delete all data from tables');
      console.log('   3. Run this script again\n');
      process.exit(0);
    }

    // Generate hashed password for admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kesehatan.com';

    console.log('👤 Creating admin user...');

    // Get department and position IDs for admin
    const { data: adminDept } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Administrasi')
      .single();

    const { data: adminPos } = await supabase
      .from('positions')
      .select('id')
      .eq('name', 'Staff Administrasi')
      .single();

    // Create admin user
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([
        {
          nip: 'ADMIN001',
          name: 'Administrator',
          email: adminEmail,
          password: hashedPassword,
          phone: '08123456789',
          department_id: adminDept?.id || null,
          position_id: adminPos?.id || null,
          role: 'admin',
          status: 'active'
        }
      ])
      .select();

    if (adminError) {
      throw new Error(`Error creating admin: ${adminError.message}`);
    }

    console.log('✅ Database initialized successfully!\n');
    console.log('═'.repeat(50));
    console.log('📊 Supabase Database Ready');
    console.log('═'.repeat(50));
    console.log('👤 Admin Credentials:');
    console.log(`   Email   : ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('═'.repeat(50));
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure you have run the SQL schema in Supabase SQL Editor');
    console.error('   2. Check your SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
    console.error('   3. Verify your Supabase project is active');
    console.error('   4. Check if tables are created in Supabase Dashboard\n');
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
