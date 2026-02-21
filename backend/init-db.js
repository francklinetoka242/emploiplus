// Script pour initialiser/corriger la base de données
import { pool } from "./src/config/database.js";
import bcrypt from "bcryptjs";
async function initDatabase() {
    try {
        console.log("🔧 Initialisation de la base de données...\n");
        // 1. Créer/recréer la table users correctement
        console.log("📝 Création de la table users...");
        await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
        await pool.query(
          `INSERT INTO admins (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)`,
          ["admin@emploi.cg", adminPassword, "Administrateur", "Principal", "super_admin"]
        );
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL DEFAULT 'candidate',
        phone TEXT,
        company_name TEXT,
        company_address TEXT,
        profession TEXT,
        job_title TEXT,
        diploma TEXT,
        experience_years INTEGER DEFAULT 0,
        skills JSONB DEFAULT '[]',
        profile_image_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        is_blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table users créée\n");
        // 2. Créer/recréer la table admins
        console.log("📝 Création de la table admins...");
        await pool.query(`DROP TABLE IF EXISTS admins CASCADE`);
        await pool.query(
          `INSERT INTO admins (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)`,
          ["contenu@emploi.cg", bcrypt.hashSync("contenu123", 10), "Admin", "Contenu", "admin_content"]
        );
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table admins créée\n");
        // 3. Créer les autres tables si elles n'existent pas
        console.log("📝 Création de la table jobs...");
        await pool.query(`DROP TABLE IF EXISTS jobs CASCADE`);
        await pool.query(
          `INSERT INTO users (first_name, last_name, email, password, user_type, phone, profession) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          ["Jean", "Dupont", "jean@example.com", userPassword, "candidate", "+242 06 123 45 67", "Développeur Full Stack"]
        );
        company_id INTEGER,
        location TEXT NOT NULL, -- format: "Ville, Pays"
        sector TEXT,
        type TEXT NOT NULL,
        salary TEXT,
        description TEXT NOT NULL,
        image_url TEXT,
        application_url TEXT,
        application_via_emploi BOOLEAN DEFAULT false,
        deadline TIMESTAMP,
        deadline_date TIMESTAMP,
        is_company_owned BOOLEAN DEFAULT false,
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table jobs créée\n");
        console.log("📝 Création de la table formations...");
        await pool.query(`DROP TABLE IF EXISTS formations CASCADE`);
        await pool.query(
          `INSERT INTO users (first_name, last_name, email, password, user_type, phone, company_name, company_address) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          ["Tech", "Solutions", "contact@techsolutions.com", userPassword, "company", "+242 06 987 65 43", "Tech Solutions SARL", "Brazzaville, Congo"]
        );
        level TEXT NOT NULL,
        duration TEXT NOT NULL,
        price TEXT,
        description TEXT NOT NULL,
        image_url TEXT,
        enrollment_deadline TIMESTAMP,
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Create a new 'trainings' table to match requested schema (French: formations compatibility)
        console.log("📝 Création de la table trainings...");
        await pool.query(`DROP TABLE IF EXISTS trainings CASCADE`);
        await pool.query(`
      CREATE TABLE trainings (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        modalities TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        deadline_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

        console.log("📝 Création de la table faqs...");
        await pool.query(`DROP TABLE IF EXISTS faqs CASCADE`);
        await pool.query(`
      CREATE TABLE faqs (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table faqs créée\n");
        console.log("✅ Table formations créée\n");
        console.log("📝 Création de la table portfolios...");
        await pool.query(`DROP TABLE IF EXISTS portfolios CASCADE`);
        await pool.query(`
      CREATE TABLE portfolios (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        project_url TEXT,
        service_category TEXT NOT NULL,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table portfolios créée\n");
        console.log("📝 Création de la table communication_channels...");
        await pool.query(`DROP TABLE IF EXISTS communication_channels CASCADE`);
        await pool.query(`
      CREATE TABLE communication_channels (
        id SERIAL PRIMARY KEY,
        channel_name TEXT NOT NULL,
        channel_url TEXT NOT NULL,
        channel_type TEXT NOT NULL,
        icon_name TEXT,
        display_order INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table communication_channels créée\n");
        console.log("📝 Création de la table publications...");
        await pool.query(`DROP TABLE IF EXISTS publications CASCADE`);
        await pool.query(`
      CREATE TABLE publications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        category TEXT DEFAULT 'annonce',
        achievement BOOLEAN DEFAULT false,
        hashtags TEXT[],
        visibility TEXT DEFAULT 'public',
        is_active BOOLEAN DEFAULT true,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table publications créée\n");
        console.log("📝 Création de la table publication_likes...");
        await pool.query(`DROP TABLE IF EXISTS publication_likes CASCADE`);
        await pool.query(`
      CREATE TABLE publication_likes (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(publication_id, user_id)
      )
    `);
        console.log("✅ Table publication_likes créée\n");
        console.log("📝 Création de la table publication_comments...");
        await pool.query(`DROP TABLE IF EXISTS publication_comments CASCADE`);
        await pool.query(`
      CREATE TABLE publication_comments (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table publication_comments créée\n");
        console.log("📝 Création de la table user_documents (CVs / Letters)...");
        await pool.query(`DROP TABLE IF EXISTS user_documents CASCADE`);
        await pool.query(`
      CREATE TABLE user_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doc_type TEXT NOT NULL, -- 'cv' or 'letter'
        title TEXT,
        storage_url TEXT, -- where the generated file/content is stored
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table user_documents créée\n");
        console.log("📝 Création de la table job_applications...");
        await pool.query(`DROP TABLE IF EXISTS job_applications CASCADE`);
        await pool.query(`
      CREATE TABLE job_applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        cv_url TEXT,
        cover_letter_url TEXT,
        additional_docs JSONB DEFAULT '[]',
        message TEXT,
        status TEXT DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table job_applications créée\n");
        console.log("📝 Création de la table saved_jobs...");
        await pool.query(`DROP TABLE IF EXISTS saved_jobs CASCADE`);
        await pool.query(`
      CREATE TABLE saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, job_id)
      )
    `);
        console.log("✅ Table saved_jobs créée\n");
        console.log("📝 Création de la table service_catalogs...");
        await pool.query(`DROP TABLE IF EXISTS service_catalogs CASCADE`);
        await pool.query(`
      CREATE TABLE service_catalogs (
        id SERIAL PRIMARY KEY,
        service_category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) DEFAULT 0,
        currency TEXT DEFAULT 'XAF',
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("✅ Table service_catalogs créée\n");
        console.log("📝 Création de la table site_settings...");
        await pool.query(`DROP TABLE IF EXISTS site_settings CASCADE`);
        await pool.query(`
      CREATE TABLE site_settings (
        key TEXT PRIMARY KEY,
        value JSONB
      )
    `);
        console.log("✅ Table site_settings créée\n");
        // 4. Insérer des données de test
        console.log("📝 Insertion de données de test...\n");
        // Super Admin
        const adminPassword = bcrypt.hashSync("admin123", 10);
        await pool.query(`INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4)`, ["admin@emploi.cg", adminPassword, "Administrateur Principal", "super_admin"]);
        console.log("✅ Super Admin créé (admin@emploi.cg / admin123)");
        // Admin contenu
        await pool.query(`INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4)`, ["contenu@emploi.cg", bcrypt.hashSync("contenu123", 10), "Admin Contenu", "admin_content"]);
        console.log("✅ Admin Contenu créé (contenu@emploi.cg / contenu123)");
        // Utilisateurs de test
        const userPassword = bcrypt.hashSync("user123", 10);
        // Candidat
        await pool.query(`INSERT INTO users (full_name, email, password, user_type, phone, profession) 
       VALUES ($1, $2, $3, $4, $5, $6)`, ["Jean Dupont", "jean@example.com", userPassword, "candidate", "+242 06 123 45 67", "Développeur Full Stack"]);
        console.log("✅ Candidat créé (jean@example.com / user123)");
        // Entreprise
        await pool.query(`INSERT INTO users (full_name, email, password, user_type, phone, company_name, company_address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, ["Tech Solutions", "contact@techsolutions.com", userPassword, "company", "+242 06 987 65 43", "Tech Solutions SARL", "Brazzaville, Congo"]);
        console.log("✅ Entreprise créée (contact@techsolutions.com / user123)");
        // Canaux de communication
        await pool.query(`INSERT INTO communication_channels (channel_name, channel_url, channel_type, icon_name, display_order, is_active)
       VALUES 
       ($1, $2, $3, $4, $5, $6),
       ($7, $8, $9, $10, $11, $12),
       ($13, $14, $15, $16, $17, $18),
       ($19, $20, $21, $22, $23, $24)`, [
            "WhatsApp", "https://wa.me/242123456789", "whatsapp", "whatsapp", 1, true,
            "Facebook", "https://facebook.com/emploiplus", "facebook", "facebook", 2, true,
            "LinkedIn", "https://linkedin.com/company/emploiplus", "linkedin", "linkedin", 3, true,
            "Journal de l'emploi", "https://journal.emploiplus.cg", "external", "newspaper", 4, true
        ]);
        console.log("✅ Canaux de communication créés\n");
        // Réalisations de test
        await pool.query(`INSERT INTO portfolios (title, description, image_url, project_url, service_category, featured)
       VALUES ($1, $2, $3, $4, $5, $6)`, ["Site Web E-commerce", "Plateforme de vente en ligne développée avec React et Node.js", "/images/portfolio1.jpg", "https://example.com", "web-development", true]);
        console.log("✅ Portfolio créé\n");
        console.log("🎉 Base de données initialisée avec succès!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Erreur lors de l'initialisation:", error);
        process.exit(1);
    }
}
initDatabase();
