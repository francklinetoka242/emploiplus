/**
 * Script SQL pour mettre à jour les URLs de fichiers lors de la migration
 * de stockage local vers Supabase
 * 
 * ATTENTION: À adapter selon votre situation
 */

-- ============================================================================
-- ÉTAPE 1: Vérifier les fichiers existants
-- ============================================================================

-- Voir tous les documents existants avec des URLs locales
SELECT id, doc_type, storage_url, created_at 
FROM user_documents 
WHERE storage_url LIKE '/uploads/%'
LIMIT 10;

-- Voir toutes les images de publications
SELECT id, image_url FROM publications 
WHERE image_url LIKE '/uploads/%'
LIMIT 10;

-- Voir les logos d'entreprises
SELECT id, profile_image_url FROM users 
WHERE user_type = 'company' 
AND profile_image_url LIKE '/uploads/%'
LIMIT 10;

-- Voir les photos de profil
SELECT id, profile_image_url FROM users 
WHERE profile_image_url LIKE '/uploads/%'
LIMIT 10;

-- ============================================================================
-- ÉTAPE 2: Migration des URLs
-- ============================================================================

-- Mettre à jour les documents candidats
UPDATE user_documents 
SET storage_url = REPLACE(
  REPLACE(storage_url, '/uploads/documents/', 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/candidats-docs/'),
  '/uploads/profiles/', 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/avatars/'
)
WHERE storage_url LIKE '/uploads/%';

-- Mettre à jour les images de publications (fil d'actualité)
UPDATE publications 
SET image_url = REPLACE(
  REPLACE(
    REPLACE(image_url, '/uploads/services/', 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/feed-posts/'),
    '/uploads/portfolios/', 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/feed-posts/'
  ),
  '/uploads/jobs/', 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/assets-emploi/'
)
WHERE image_url LIKE '/uploads/%';

-- Mettre à jour les logos d'entreprises
UPDATE users 
SET profile_image_url = REPLACE(
  profile_image_url, 
  '/uploads/profiles/', 
  'https://[PROJECT_ID].supabase.co/storage/v1/object/public/entreprises/'
)
WHERE user_type = 'company' 
AND profile_image_url LIKE '/uploads/profiles/%';

-- Mettre à jour les photos de profil des candidats
UPDATE users 
SET profile_image_url = REPLACE(
  profile_image_url, 
  '/uploads/profiles/', 
  'https://[PROJECT_ID].supabase.co/storage/v1/object/public/avatars/'
)
WHERE user_type = 'candidate' 
AND profile_image_url LIKE '/uploads/profiles/%';

-- ============================================================================
-- ÉTAPE 3: Vérification post-migration
-- ============================================================================

-- Vérifier qu'il n'y a plus d'URLs locales
SELECT COUNT(*) as still_local_urls 
FROM (
  SELECT storage_url FROM user_documents WHERE storage_url LIKE '/uploads/%'
  UNION ALL
  SELECT image_url FROM publications WHERE image_url LIKE '/uploads/%'
  UNION ALL
  SELECT profile_image_url FROM users WHERE profile_image_url LIKE '/uploads/%'
) as all_urls;

-- Le résultat devrait être 0

-- Vérifier que les URLs Supabase sont valides
SELECT COUNT(*) as supabase_urls 
FROM (
  SELECT storage_url FROM user_documents WHERE storage_url LIKE 'https://%.supabase.co%'
  UNION ALL
  SELECT image_url FROM publications WHERE image_url LIKE 'https://%.supabase.co%'
  UNION ALL
  SELECT profile_image_url FROM users WHERE profile_image_url LIKE 'https://%.supabase.co%'
) as all_urls;

-- ============================================================================
-- ÉTAPE 4: Rollback (si nécessaire)
-- ============================================================================

-- Si quelque chose s'est mal passé, vous pouvez revenir en arrière
-- (À adapter selon vos sauvegardes)

/*
UPDATE user_documents 
SET storage_url = REPLACE(storage_url, 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/candidats-docs/', '/uploads/documents/')
WHERE storage_url LIKE 'https://%.supabase.co%';

UPDATE publications 
SET image_url = REPLACE(image_url, 'https://[PROJECT_ID].supabase.co/storage/v1/object/public/feed-posts/', '/uploads/services/')
WHERE image_url LIKE 'https://%.supabase.co%';
*/

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

/*
1. Remplacer [PROJECT_ID] par votre vrai ID de projet Supabase
   Format: https://[PROJECT_ID].supabase.co
   Exemple: https://gcwqiplhiwbicnisnaay.supabase.co

2. Tester d'abord sur une copie de la base de données

3. Faire une sauvegarde AVANT d'exécuter les migrations

4. Exécuter les queries de vérification AVANT et APRÈS

5. Les anciens fichiers sur le Mac peuvent être supprimés après vérification
*/
