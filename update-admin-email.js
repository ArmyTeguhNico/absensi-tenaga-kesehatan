require('dotenv').config();
const supabase = require('./database/config');

async function updateAdminEmail() {
  try {
    console.log('🔄 Updating admin email...\n');

    // Update admin email
    const { data, error } = await supabase
      .from('users')
      .update({ email: 'armyteguh00@gmail.com' })
      .eq('role', 'admin')
      .eq('email', 'admin@kesehatan.com')
      .select();

    if (error) {
      throw new Error(`Error updating email: ${error.message}`);
    }

    if (data && data.length > 0) {
      console.log('✅ Admin email updated successfully!\n');
      console.log('═'.repeat(50));
      console.log('📧 New Admin Email: armyteguh00@gmail.com');
      console.log('🔑 Password remains: Admin123!');
      console.log('═'.repeat(50));
      console.log('\n✨ You can now login with:');
      console.log('   Email   : armyteguh00@gmail.com');
      console.log('   Password: Admin123!\n');
    } else {
      console.log('ℹ️  No admin user found with email admin@kesehatan.com');
      console.log('   Admin email might already be updated or user doesn\'t exist.\n');
      
      // Check current admin
      const { data: adminData } = await supabase
        .from('users')
        .select('email, name, role')
        .eq('role', 'admin')
        .limit(1);
      
      if (adminData && adminData.length > 0) {
        console.log('Current admin email:', adminData[0].email);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run update
updateAdminEmail();
