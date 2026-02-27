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

async function analyzeDatabase() {
  try {
    console.log('\n' + '='.repeat(100));
    console.log('🔍 AUDIT COMPLET DE LA BASE DE DONNÉES: emploiplus_db');
    console.log('='.repeat(100) + '\n');

    // 1. Lister toutes les tables
    console.log('📋 TABLES EXISTANTES:');
    console.log('-'.repeat(100));
    
    const tablesResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        (SELECT COUNT(*) FROM information_schema.tables) as total_tables
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tables = tablesResult.rows;
    console.log(`Total de tables: ${tables.length}\n`);
    
    tables.forEach((table, idx) => {
      console.log(`${idx + 1}. ${table.tablename}`);
    });

    // 2. Analyser chaque table
    console.log('\n' + '='.repeat(100));
    console.log('📊 STRUCTURE DÉTAILLÉE DE CHAQUE TABLE:');
    console.log('='.repeat(100) + '\n');

    for (const table of tables) {
      const tableName = table.tablename;
      
      // Récupérer le nombre de lignes
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      const rowCount = countResult.rows[0].count;

      // Récupérer les colonnes
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log(`\n🗂️ TABLE: ${tableName}`);
      console.log(`   Lignes: ${rowCount}`);
      console.log(`   Colonnes: ${columnsResult.rows.length}`);
      console.log(`   Structure:`);
      
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }

    // 3. Résumé
    console.log('\n' + '='.repeat(100));
    console.log('📈 RÉSUMÉ:');
    console.log('='.repeat(100));
    console.log(`Total de tables: ${tables.length}`);
    console.log('\nTables trouvées:');
    tables.forEach(t => console.log(`  ✅ ${t.tablename}`));

    // Vérifications spécifiques
    console.log('\n🔎 VÉRIFICATIONS SPÉCIFIQUES:');
    const hasJobs = tables.some(t => t.tablename === 'jobs');
    const hasFormations = tables.some(t => t.tablename === 'formations');
    const hasAdmins = tables.some(t => t.tablename === 'admins');
    
    console.log(`  ${hasJobs ? '✅' : '❌'} Table "jobs" exist: ${hasJobs}`);
    console.log(`  ${hasFormations ? '✅' : '❌'} Table "formations" exist: ${hasFormations}`);
    console.log(`  ${hasAdmins ? '✅' : '❌'} Table "admins" exist: ${hasAdmins}`);

    console.log('\n' + '='.repeat(100) + '\n');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await pool.end();
  }
}

analyzeDatabase();
