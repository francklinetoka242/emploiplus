/**
 * Admin Upload Controller
 * Handles file uploads with Multer and image optimization with Sharp
 */

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory on VPS
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

// Ensure upload directories exist
async function ensureUploadDirs() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}

ensureUploadDirs();

/**
 * Configure Multer storage
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

/**
 * Optimize image with Sharp
 */
async function optimizeImage(inputPath: string, outputPath: string, width = 1920, quality = 80) {
  try {
    await sharp(inputPath)
      .resize(width, width, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toFile(outputPath);

    // Delete original temp file
    await fs.unlink(inputPath);

    return outputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
}

/**
 * Handle single file upload (job/training images, etc.)
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { type = 'general' } = req.body; // 'job', 'training', 'service', 'general'
    const typeDir = path.join(UPLOAD_DIR, type);

    // Create type directory
    await fs.mkdir(typeDir, { recursive: true });

    let finalFilePath = req.file.path;
    let filename = req.file.filename;

    // Optimize images
    if (req.file.mimetype.startsWith('image/')) {
      const outputPath = path.join(typeDir, filename.replace(/\.[^.]+$/, '.webp'));
      finalFilePath = await optimizeImage(req.file.path, outputPath);
      filename = path.basename(finalFilePath);
    } else {
      // Move non-image files
      const finalPath = path.join(typeDir, filename);
      await fs.copyFile(req.file.path, finalPath);
      await fs.unlink(req.file.path);
      finalFilePath = finalPath;
    }

    const relativePath = path.relative(UPLOAD_DIR, finalFilePath);

    res.json({
      message: 'Fichier téléchargé avec succès',
      filename,
      path: `/uploads/${relativePath}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du téléchargement' });
  }
}

/**
 * Handle multiple file uploads
 */
export async function uploadMultipleFiles(req: Request, res: Response) {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { type = 'general' } = req.body;
    const typeDir = path.join(UPLOAD_DIR, type);
    await fs.mkdir(typeDir, { recursive: true });

    const uploadedFiles = [];

    for (const file of req.files) {
      let finalFilePath = file.path;
      let filename = file.filename;

      if (file.mimetype.startsWith('image/')) {
        const outputPath = path.join(typeDir, filename.replace(/\.[^.]+$/, '.webp'));
        finalFilePath = await optimizeImage(file.path, outputPath);
        filename = path.basename(finalFilePath);
      } else {
        const finalPath = path.join(typeDir, filename);
        await fs.copyFile(file.path, finalPath);
        await fs.unlink(file.path);
        finalFilePath = finalPath;
      }

      const relativePath = path.relative(UPLOAD_DIR, finalFilePath);
      uploadedFiles.push({
        filename,
        path: `/uploads/${relativePath}`,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    res.json({
      message: `${uploadedFiles.length} fichier(s) téléchargé(s) avec succès`,
      files: uploadedFiles
    });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du téléchargement' });
  }
}

/**
 * Create thumbnail for image
 */
export async function createThumbnail(req: Request, res: Response) {
  try {
    const { filepath } = req.body;

    if (!filepath) {
      return res.status(400).json({ error: 'Chemin du fichier manquant' });
    }

    const fullPath = path.join(UPLOAD_DIR, filepath);
    const thumbnailPath = path.join(
      path.dirname(fullPath),
      'thumbs',
      path.basename(fullPath)
    );

    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });

    await sharp(fullPath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);

    const relativePath = path.relative(UPLOAD_DIR, thumbnailPath);

    res.json({
      message: 'Miniature créée avec succès',
      thumbnail: `/uploads/${relativePath}`
    });
  } catch (error: any) {
    console.error('Error creating thumbnail:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la création' });
  }
}

/**
 * Delete uploaded file
 */
export async function deleteFile(req: Request, res: Response) {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'Chemin du fichier manquant' });
    }

    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Prevent directory traversal attacks
    if (!fullPath.startsWith(UPLOAD_DIR)) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    await fs.unlink(fullPath);

    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la suppression' });
  }
}

/**
 * Get upload statistics
 */
export async function getUploadStats(req: Request, res: Response) {
  try {
    const stats = {
      uploadDir: UPLOAD_DIR,
      directoryExists: true,
      files: 0,
      totalSize: 0,
      subdirectories: [] as string[]
    };

    try {
      const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          stats.subdirectories.push(entry.name);
        } else if (entry.isFile()) {
          stats.files++;
          const filePath = path.join(UPLOAD_DIR, entry.name);
          const fileStats = await fs.stat(filePath);
          stats.totalSize += fileStats.size;
        }
      }
    } catch (error) {
      stats.directoryExists = false;
    }

    stats.totalSize = Math.round(stats.totalSize / 1024 / 1024 * 100) / 100; // Convert to MB

    res.json(stats);
  } catch (error) {
    console.error('Error getting upload stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}
