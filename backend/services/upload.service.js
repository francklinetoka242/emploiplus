import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import UserModel from '../models/user.model.js';

// ESM does not provide __dirname; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// directory where uploaded files will be stored
const UPLOAD_DIR = path.join(__dirname, '../../uploads/candidates');

// ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Save uploaded candidate document to disk and persist its URL to user's profile
 * @param {Object} file - Multer file object or an object with { buffer, originalname, path }
 * @param {string} docKey - logical key for the document (eg. 'cv', 'portfolio')
 * @param {string} userId - id of the candidate user
 * @param {string} dbColumn - column name in users table where URL must be stored
 * @returns {Promise<{success:boolean,url?:string,message?:string}>}
 */
async function uploadCandidateDocAndSave(file, docKey, userId, dbColumn) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!dbColumn) {
      throw new Error('dbColumn is required to persist the file URL');
    }

    // determine file extension
    const originalName = file.originalname || path.basename(file.path || 'file');
    const ext = path.extname(originalName) || '.dat';

    // build filename and destination
    const filename = `${userId}_${docKey}_${Date.now()}${ext}`;
    const destPath = path.join(UPLOAD_DIR, filename);

    // handle buffer (memory) or move existing file on disk
    if (file.buffer) {
      // write buffer to disk
      await fs.promises.writeFile(destPath, file.buffer);
    } else if (file.path) {
      // move file from temp path to destination
      await fs.promises.rename(file.path, destPath);
    } else {
      throw new Error('File object must contain `buffer` or `path`');
    }

    // Construct a URL/path to store in DB. Adjust as needed for your static hosting.
    // Using a relative path under /uploads/candidates so static middleware can serve it.
    const urlPath = `/uploads/candidates/${filename}`;

    // persist URL into user's profile column
    const updates = {};
    updates[dbColumn] = urlPath;

    const updated = await UserModel.updateUser(userId, updates);
    if (!updated) {
      return { success: false, message: 'Failed to update user record with document URL' };
    }

    return { success: true, url: urlPath };
  } catch (err) {
    console.error('uploadCandidateDocAndSave error:', err);
    return { success: false, message: err.message || 'Upload failed' };
  }
}

export default {
  uploadCandidateDocAndSave,
};
