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

async function checkAndInsertFormations() {
  try {
    // 1. Vérifier la structure
    console.log('\n📚 VÉRIFICATION TABLE FORMATIONS\n');
    
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'formations'
      ORDER BY ordinal_position
    `);

    console.log('📋 Structure de la table:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });

    // 2. Compter les formations existantes
    const countResult = await pool.query('SELECT COUNT(*) as total FROM formations');
    console.log(`\n📊 Formations actuelles: ${countResult.rows[0].total}`);

    // 3. Afficher les formations existantes
    const existingResult = await pool.query('SELECT id, title, category, level FROM formations LIMIT 5');
    if (existingResult.rows.length > 0) {
      console.log('\n📚 Formations existantes:');
      existingResult.rows.forEach(f => {
        console.log(`  - ${f.title} (${f.category}, ${f.level})`);
      });
    }

    // 4. Insérer des formations de test
    console.log('\n➕ Insertion de formations de test...');
    
    const formations = [
      {
        title: 'React Avancé - Hooks & Context API',
        category: 'Web Development',
        level: 'Intermédiaire',
        duration: '4 semaines',
        description: 'Maîtrisez les Hooks React, Context API, et les patterns avancés. Idéal pour les développeurs ayant une base en React.',
        price: '199.99'
      },
      {
        title: 'Node.js & Express - API REST Complète',
        category: 'Backend Development',
        level: 'Intermédiaire',
        duration: '5 semaines',
        description: 'Créez des APIs REST scalables avec Node.js et Express. Authentification, validation, et tests inclus.',
        price: '249.99'
      },
      {
        title: 'Vue.js 3 - Composition API',
        category: 'Web Development',
        level: 'Débutant',
        duration: '3 semaines',
        description: 'Apprenez Vue.js 3 avec la Composition API pour construire des applications web modernes et réactives.',
        price: '179.99'
      },
      {
        title: 'Python pour l\'Analyse de Données',
        category: 'Data Science',
        level: 'Intermédiaire',
        duration: '6 semaines',
        description: 'Pandas, NumPy, Matplotlib - Tous les outils pour analyser et visualiser les données avec Python.',
        price: '229.99'
      },
      {
        title: 'TypeScript Professionnel',
        category: 'Web Development',
        level: 'Avancé',
        duration: '4 semaines',
        description: 'Devenez expert en TypeScript avec les types avancés, les décorateurs, et les patterns d\'architecture.',
        price: '219.99'
      },
      {
        title: 'Machine Learning avec Python',
        category: 'Data Science',
        level: 'Avancé',
        duration: '8 semaines',
        description: 'Scikit-learn, TensorFlow, Deep Learning. Construisez des modèles ML pour des cas réels.',
        price: '299.99'
      },
      {
        title: 'Docker & Kubernetes pour DevOps',
        category: 'DevOps',
        level: 'Avancé',
        duration: '5 semaines',
        description: 'Containerisez vos applications et orchestrez-les avec Kubernetes en production.',
        price: '269.99'
      },
      {
        title: 'Sécurité Web - OWASP',
        category: 'Security',
        level: 'Intermédiaire',
        duration: '4 semaines',
        description: 'Apprenez les failles web courantes et comment les sécuriser. OWASP Top 10 couvert.',
        price: '189.99'
      }
    ];

    let insertedCount = 0;
    for (const formation of formations) {
      try {
        const result = await pool.query(
          `INSERT INTO formations (title, category, level, duration, description, price, published, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id`,
          [formation.title, formation.category, formation.level, formation.duration, formation.description, formation.price, true]
        );
        console.log(`  ✅ ${formation.title} (ID: ${result.rows[0].id})`);
        insertedCount++;
      } catch (err) {
        if (err.message.includes('duplicate') || err.message.includes('violates unique')) {
          console.log(`  ⚠️  ${formation.title} (déjà existante)`);
        } else {
          console.log(`  ❌ ${formation.title}: ${err.message}`);
        }
      }
    }

    // 5. Statut final
    console.log(`\n✅ ${insertedCount} formations insérées`);
    
    const finalCount = await pool.query('SELECT COUNT(*) as total FROM formations');
    console.log(`📊 Total formations dans la BD: ${finalCount.rows[0].total}\n`);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await pool.end();
  }
}

checkAndInsertFormations();
