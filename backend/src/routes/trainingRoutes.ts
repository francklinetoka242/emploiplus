import express from 'express';
import {
  listTrainings, getTraining, createTraining, updateTraining, deleteTraining
} from '../controllers/trainings.controller.js';

const router = express.Router();

router.get('/', listTrainings);
router.get('/:id', getTraining);
router.post('/', createTraining);
router.put('/:id', updateTraining);
router.delete('/:id', deleteTraining);

export default router;
