import UserModel from '../models/user.model.js';

(async () => {
  try {
    const users = await UserModel.getAllUsers(5,0);
    console.log('users:', users);
  } catch (err) {
    console.error('model error', err);
  } finally {
    process.exit(0);
  }
})();
