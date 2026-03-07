import pool from './config/db.js';

async function checkJobs() {
  try {
    console.log('🔍 Checking jobs in database...');
    const result = await pool.query('SELECT COUNT(*) as total_jobs FROM jobs');
    console.log(`📊 Total jobs in database: ${result.rows[0].total_jobs}`);

    if (parseInt(result.rows[0].total_jobs) > 0) {
      const jobs = await pool.query('SELECT id, title, published, created_at FROM jobs ORDER BY created_at DESC LIMIT 5');
      console.log('📋 Recent jobs:');
      jobs.rows.forEach(job => {
        console.log(`   • ${job.id}: ${job.title} (Published: ${job.published})`);
      });
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit(0);
  }
}

checkJobs();