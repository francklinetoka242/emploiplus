import('./backend/src/config/database.js').then(async ({ pool }) => {
  try {
    // Insert test publication
    await pool.query(`
      INSERT INTO publications (user_id, author_id, content, visibility, is_active)
      VALUES (1, 1, 'Test publication content', 'public', true)
    `);
    
    // Fetch to confirm
    const result = await pool.query(`
      SELECT 
        p.id,
        p.author_id as user_id,
        p.author_id,
        p.content,
        p.image_url,
        p.visibility,
        p.hashtags,
        p.is_active,
        p.created_at,
        p.updated_at,
        u.full_name,
        u.company_name,
        u.profile_image_url,
        u.user_type
      FROM publications p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `);
    console.log('✅ Test data inserted and query succeeded!');
    console.log('Rows:', JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('Import error:', e);
  process.exit(1);
});
