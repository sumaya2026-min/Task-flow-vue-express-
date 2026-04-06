import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: String, default: '' }
  },
  { _id: true }
);

const columnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    tasks: [taskSchema]
  },
  { _id: true }
);

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    columns: {
      type: [columnSchema],
      default: [
        { title: 'To Do', tasks: [] },
        { title: 'In Progress', tasks: [] },
        { title: 'Done', tasks: [] }
      ]
    }
  },
  { timestamps: true }
);

export default mongoose.model('Board', boardSchema);
