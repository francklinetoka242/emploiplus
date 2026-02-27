import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'emploi_plus_db_cg',
});

async function createTriggers() {
  try {
    console.log('Creating triggers for search_vector auto-update...');

    // Trigger pour jobs
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_jobs_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('french', COALESCE(NEW.company, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Function update_jobs_search_vector created');

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_update_jobs_search_vector ON jobs;
      CREATE TRIGGER trg_update_jobs_search_vector
      BEFORE INSERT OR UPDATE ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION update_jobs_search_vector();
    `);
    console.log('✓ Trigger trg_update_jobs_search_vector created');

    // Trigger pour formations
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_formations_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('french', COALESCE(NEW.category, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Function update_formations_search_vector created');

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_update_formations_search_vector ON formations;
      CREATE TRIGGER trg_update_formations_search_vector
      BEFORE INSERT OR UPDATE ON formations
      FOR EACH ROW
      EXECUTE FUNCTION update_formations_search_vector();
    `);
    console.log('✓ Trigger trg_update_formations_search_vector created');

    // Trigger pour users
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_users_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('french', COALESCE(NEW.full_name, '') || ' ' || COALESCE(NEW.company_name, '')), 'A') ||
          setweight(to_tsvector('french', COALESCE(NEW.profession, '') || ' ' || COALESCE(NEW.job_title, '')), 'B') ||
          setweight(to_tsvector('french', COALESCE(NEW.city, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Function update_users_search_vector created');

    await pool.query(`
      DROP TRIGGER IF EXISTS trg_update_users_search_vector ON users;
      CREATE TRIGGER trg_update_users_search_vector
      BEFORE INSERT OR UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_users_search_vector();
    `);
    console.log('✓ Trigger trg_update_users_search_vector created');

    console.log('\n✅ All triggers created successfully!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTriggers();
