#!/usr/bin/env node
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'emploip01_admin',
  password: 'vcybk24235GDWe',
  database: 'emploiplus_db',
});

async function checkJobs() {
  try {
    // Compter les offres
    const countResult = await pool.query('SELECT COUNT(*) as total FROM jobs');
    console.log('\n📊 OFFRES D\'EMPLOI DANS LA BASE DE DONNÉES');
    console.log('='.repeat(80));
    console.log(`Total d'offres: ${countResult.rows[0].total}\n`);

    // Afficher les détails
    const jobsResult = await pool.query(`
      SELECT 
        id, 
        title, 
        company, 
        location, 
        type, 
        sector, 
        salary, 
        published,
        created_at
      FROM jobs 
      ORDER BY created_at DESC
    `);

    if (jobsResult.rows.length === 0) {
      console.log('❌ Pas d\'offres trouvées\n');
      return;
    }

    console.log('📋 OFFRES EXISTANTES:');
    console.log('-'.repeat(80));
    
    jobsResult.rows.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Entreprise: ${job.company}`);
      console.log(`   Localisation: ${job.location}`);
      console.log(`   Type: ${job.type}`);
      console.log(`   Secteur: ${job.sector}`);
      console.log(`   Salaire: ${job.salary}`);
      console.log(`   Publiée: ${job.published ? '✅ Oui' : '❌ Non'}`);
      console.log(`   Créée le: ${new Date(job.created_at).toLocaleString('fr-FR')}`);
      console.log(`   ID: ${job.id}`);
    });

    // Statistiques
    console.log('\n' + '='.repeat(80));
    console.log('📈 STATISTIQUES:');
    const published = jobsResult.rows.filter(j => j.published).length;
    const unpublished = jobsResult.rows.filter(j => !j.published).length;
    
    console.log(`   Offres publiées: ${published} (${Math.round(published/jobsResult.rows.length*100)}%)`);
    console.log(`   Offres non publiées: ${unpublished} (${Math.round(unpublished/jobsResult.rows.length*100)}%)`);
    
    const sectors = new Map();
    jobsResult.rows.forEach(job => {
      sectors.set(job.sector, (sectors.get(job.sector) || 0) + 1);
    });
    
    console.log('\n   Par secteur:');
    sectors.forEach((count, sector) => {
      console.log(`     - ${sector}: ${count}`);
    });

    console.log('\n');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await pool.end();
  }
}

checkJobs();
