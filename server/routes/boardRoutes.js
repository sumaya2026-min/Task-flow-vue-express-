import express from 'express';
import {
  addColumn,
  addTask,
  createBoard,
  deleteColumn,
  deleteTask,
  getBoards,
  moveTask,
  updateBoardName,
  updateColumn,
  updateTask
} from '../controllers/boardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBoards);
router.post('/', createBoard);
router.patch('/:boardId', updateBoardName);
router.post('/:boardId/columns', addColumn);
router.patch('/:boardId/columns/:columnId', updateColumn);
router.delete('/:boardId/columns/:columnId', deleteColumn);
router.post('/:boardId/columns/:columnId/tasks', addTask);
router.patch('/:boardId/columns/:columnId/tasks/:taskId', updateTask);
router.delete('/:boardId/columns/:columnId/tasks/:taskId', deleteTask);
router.post('/:boardId/move-task', moveTask);

export default router;
