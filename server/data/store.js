import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const dataDir = path.resolve('data');
const dataFile = path.join(dataDir, 'local-db.json');

let dbState = null;
let writeQueue = Promise.resolve();

const createId = () => randomUUID();

const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultColumns = () => [
  { _id: createId(), title: 'To Do', tasks: [] },
  { _id: createId(), title: 'In Progress', tasks: [] },
  { _id: createId(), title: 'Done', tasks: [] }
];

const createInitialState = () => ({
  users: [],
  boards: []
});

const ensureLoaded = async () => {
  if (dbState) {
    return dbState;
  }

  await fs.mkdir(dataDir, { recursive: true });

  try {
    const file = await fs.readFile(dataFile, 'utf8');
    dbState = JSON.parse(file);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    dbState = createInitialState();
    await fs.writeFile(dataFile, JSON.stringify(dbState, null, 2));
  }

  return dbState;
};

const persist = async () => {
  await ensureLoaded();
  writeQueue = writeQueue.then(() => fs.writeFile(dataFile, JSON.stringify(dbState, null, 2)));
  await writeQueue;
};

const stampTimestamps = (record, isNew = false) => {
  const now = new Date().toISOString();
  if (isNew && !record.createdAt) {
    record.createdAt = now;
  }
  record.updatedAt = now;
};

const normalizeBoard = (board) => ({
  ...clone(board),
  columns: board.columns.map((column) => ({
    ...clone(column),
    tasks: column.tasks.map((task) => clone(task))
  }))
});

export const localStore = {
  async findUserByEmail(email) {
    const state = await ensureLoaded();
    return clone(state.users.find((user) => user.email === email) || null);
  },

  async findUserById(id) {
    const state = await ensureLoaded();
    return clone(state.users.find((user) => user._id === id) || null);
  },

  async createUser({ name, email, password }) {
    const state = await ensureLoaded();
    const user = {
      _id: createId(),
      name,
      email,
      password
    };
    stampTimestamps(user, true);
    state.users.push(user);
    await persist();
    return clone(user);
  },

  async getBoardsByOwner(ownerId) {
    const state = await ensureLoaded();
    return state.boards
      .filter((board) => board.owner === ownerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((board) => normalizeBoard(board));
  },

  async findBoard(boardId, ownerId) {
    const state = await ensureLoaded();
    const board = state.boards.find((item) => item._id === boardId && item.owner === ownerId);
    return board ? normalizeBoard(board) : null;
  },

  async createBoard({ name, owner }) {
    const state = await ensureLoaded();
    const board = {
      _id: createId(),
      name,
      owner,
      columns: defaultColumns()
    };
    stampTimestamps(board, true);
    state.boards.push(board);
    await persist();
    return normalizeBoard(board);
  },

  async saveBoard(board) {
    const state = await ensureLoaded();
    const index = state.boards.findIndex((item) => item._id === board._id);
    if (index === -1) {
      throw new Error('Board not found');
    }

    const storedBoard = {
      ...clone(board),
      columns: board.columns.map((column) => ({
        _id: column._id || createId(),
        title: column.title,
        tasks: (column.tasks || []).map((task) => ({
          _id: task._id || createId(),
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'medium',
          dueDate: task.dueDate || ''
        }))
      }))
    };

    stampTimestamps(storedBoard);
    state.boards[index] = storedBoard;
    await persist();
    return normalizeBoard(storedBoard);
  }
};
