// env.js - chargement et validation des variables d'environnement
// utilise dotenv pour lire le fichier .env au démarrage

const dotenv = require('dotenv');

// charge .env dans process.env (si présent)
dotenv.config();

// liste des variables critiques nécessaires au fonctionnement du serveur
// DATABASE_URL contient toutes les infos de connexion PostgreSQL (host, user, password, db, port)
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

// Vérifie la présence de chaque variable requise, sinon quitte le processus
requiredVars.forEach((name) => {
  if (!process.env[name]) {
    console.error(`🔴 Missing required environment variable: ${name}`);
    console.error(`   Please add ${name} to your .env file and try again.`);
    process.exit(1);
  }
});

// Export des variables validées pour garantir qu'elles existent partout
// DATABASE_URL doit être au format: postgresql://user:password@host:port/database
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
