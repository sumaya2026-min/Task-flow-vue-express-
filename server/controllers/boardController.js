import { repository } from '../data/repository.js';

const findBoard = async (boardId, userId) => {
  const board = await repository.findBoard(boardId, userId);
  if (!board) {
    const error = new Error('Board not found');
    error.status = 404;
    throw error;
  }
  return board;
};

export const getBoards = async (req, res) => {
  const boards = await repository.getBoardsByOwner(req.user.id);
  res.json(boards);
};

export const createBoard = async (req, res) => {
  const { name } = req.body;
  const board = await repository.createBoard({
    name: name || 'New Board',
    owner: req.user.id
  });
  res.status(201).json(board);
};

export const updateBoardName = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  board.name = req.body.name || board.name;
  await board.save();
  res.json(board);
};

export const addColumn = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  board.columns.push({ title: req.body.title || 'New Column', tasks: [] });
  await board.save();
  res.status(201).json(board);
};

export const updateColumn = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  const column = board.columns.id(req.params.columnId);
  if (!column) return res.status(404).json({ message: 'Column not found' });
  column.title = req.body.title || column.title;
  await board.save();
  res.json(board);
};

export const deleteColumn = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  const column = board.columns.id(req.params.columnId);
  if (!column) return res.status(404).json({ message: 'Column not found' });
  column.deleteOne();
  await board.save();
  res.json(board);
};

export const addTask = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  const column = board.columns.id(req.params.columnId);
  if (!column) return res.status(404).json({ message: 'Column not found' });

  column.tasks.push({
    title: req.body.title,
    description: req.body.description || '',
    priority: req.body.priority || 'medium',
    dueDate: req.body.dueDate || ''
  });

  await board.save();
  res.status(201).json(board);
};

export const updateTask = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  const column = board.columns.id(req.params.columnId);
  if (!column) return res.status(404).json({ message: 'Column not found' });

  const task = column.tasks.id(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.title = req.body.title ?? task.title;
  task.description = req.body.description ?? task.description;
  task.priority = req.body.priority ?? task.priority;
  task.dueDate = req.body.dueDate ?? task.dueDate;

  await board.save();
  res.json(board);
};

export const deleteTask = async (req, res) => {
  const board = await findBoard(req.params.boardId, req.user.id);
  const column = board.columns.id(req.params.columnId);
  if (!column) return res.status(404).json({ message: 'Column not found' });

  const task = column.tasks.id(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.deleteOne();
  await board.save();
  res.json(board);
};

export const moveTask = async (req, res) => {
  const { sourceColumnId, destinationColumnId, taskId } = req.body;
  const board = await findBoard(req.params.boardId, req.user.id);

  const sourceColumn = board.columns.id(sourceColumnId);
  const destinationColumn = board.columns.id(destinationColumnId);

  if (!sourceColumn || !destinationColumn) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const task = sourceColumn.tasks.id(taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const taskObject = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate
  };

  task.deleteOne();
  destinationColumn.tasks.push(taskObject);

  await board.save();
  res.json(board);
};
