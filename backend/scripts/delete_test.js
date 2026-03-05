import userService from '../services/user.service.js';

(async () => {
  const id = process.argv[2] || '13';
  try {
    console.log('Attempting to delete user', id);
    const res = await userService.deleteUser(id);
    console.log('delete result:', res);
  } catch (err) {
    console.error('delete_test error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
