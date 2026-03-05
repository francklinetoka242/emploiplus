import pool from './config/db.js';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing PostgreSQL connection to emploi_plus_db_cg...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test: lire les tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found in emploi_plus_db_cg:');
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`   • ${row.table_name}`);
      });
    } else {
      console.log('   (No tables found)');
    }
    
    client.release();
    console.log('\n✅ Database test completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

testDatabaseConnection();
