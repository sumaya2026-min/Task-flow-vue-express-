import User from '../models/User.js';
import Board from '../models/Board.js';
import { localStore } from './store.js';

const withIdHelpers = (items = []) => {
  const list = items.map((item) => withDocumentHelpers(item));
  list.id = (id) => list.find((item) => item._id === id) || null;
  return list;
};

const withDocumentHelpers = (board) => {
  if (!board) {
    return null;
  }

  const document = { ...board };
  document.columns = withIdHelpers(
    (board.columns || []).map((column) => ({
      ...column,
      tasks: withIdHelpers(column.tasks || []),
      deleteOne() {
        document.columns = withIdHelpers(document.columns.filter((item) => item._id !== column._id));
      }
    }))
  );

  document.columns.forEach((column) => {
    column.tasks = withIdHelpers(
      (column.tasks || []).map((task) => ({
        ...task,
        deleteOne() {
          column.tasks = withIdHelpers(column.tasks.filter((item) => item._id !== task._id));
        }
      }))
    );
  });

  document.save = async () => {
    const saved = await localStore.saveBoard({
      ...document,
      columns: document.columns.map((column) => ({
        _id: column._id,
        title: column.title,
        tasks: column.tasks.map((task) => ({
          _id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate
        }))
      }))
    });

    return withDocumentHelpers(saved);
  };

  return document;
};

export const repository = {
  useMongo: false,

  setMode(useMongo) {
    this.useMongo = useMongo;
  },

  async findUserByEmail(email) {
    return this.useMongo ? User.findOne({ email }) : localStore.findUserByEmail(email);
  },

  async findUserById(id) {
    if (this.useMongo) {
      return User.findById(id).select('-password');
    }

    const user = await localStore.findUserById(id);
    if (!user) {
      return null;
    }

    const { password, ...safeUser } = user;
    return safeUser;
  },

  async createUser(payload) {
    return this.useMongo ? User.create(payload) : localStore.createUser(payload);
  },

  async createBoard(payload) {
    const board = this.useMongo ? await Board.create(payload) : await localStore.createBoard(payload);
    return this.useMongo ? board : withDocumentHelpers(board);
  },

  async getBoardsByOwner(ownerId) {
    if (this.useMongo) {
      return Board.find({ owner: ownerId }).sort({ createdAt: -1 });
    }

    const boards = await localStore.getBoardsByOwner(ownerId);
    return boards.map((board) => withDocumentHelpers(board));
  },

  async findBoard(boardId, ownerId) {
    if (this.useMongo) {
      return Board.findOne({ _id: boardId, owner: ownerId });
    }

    const board = await localStore.findBoard(boardId, ownerId);
    return withDocumentHelpers(board);
  }
};
