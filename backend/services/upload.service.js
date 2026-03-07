import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import UserModel from '../models/user.model.js';
import {
  getDestinationPath,
  generateFilename,
  isPublicType,
  UPLOAD_CONFIG
} from '../config/upload.config.js';
import sharp from 'sharp';

// ESM does not provide __dirname; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// helper mapping from frontend keys to config types
const DOC_TYPE_MAP = {
  cv: 'CV',
  lm: 'RESUME',
  diplome: 'DIPLOMA',
  certificat_travail: 'DIPLOMA',
  cni: 'IDENTITY',
  passeport: 'IDENTITY',
  carte_residence: 'IDENTITY',
  nui: 'IDENTITY',
  recepisse_acpe: 'IDENTITY'
};

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

    // determine config type based on docKey
    const type = DOC_TYPE_MAP[docKey] || 'CV';
    const config = UPLOAD_CONFIG.TYPES[type];

    // build filename and destination using helpers
    let filename = generateFilename(type, { userId, docType: docKey }, ext);
    const destDir = path.join(__dirname, '../../', getDestinationPath(type));

    // ensure directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, filename);

    // handle buffer (memory) or move existing file on disk
    if (file.buffer) {
      await fs.promises.writeFile(destPath, file.buffer);
    } else if (file.path) {
      await fs.promises.rename(file.path, destPath);
    } else {
      throw new Error('File object must contain `buffer` or `path`');
    }

    // if the file is an image and not too large, compress/resize to save space
    const isImage = config.allowedTypes.some(t => t.startsWith('image/'));
    if (isImage) {
      try {
        const optimizedPath = destPath.replace(path.extname(destPath), '.webp');
        await sharp(destPath)
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .toFormat('webp', { quality: 80 })
          .toFile(optimizedPath);
        // remove original if different
        if (optimizedPath !== destPath) {
          await fs.promises.unlink(destPath);
          filename = path.basename(optimizedPath);
          // update urlPath construction below
        }
      } catch (imgErr) {
        console.warn('Image optimization failed', imgErr.message);
      }
    }

    // Construct a URL/path to store in DB
    let urlPath;
    if (isPublicType(type)) {
      urlPath = `/uploads/public/${config.dir}/${filename}`;
    } else {
      // private files will be accessed via secure route
      urlPath = `/api/uploads/secure/${type.toLowerCase()}/${filename}`;
    }

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
