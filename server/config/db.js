import mongoose from 'mongoose';
import { repository } from '../data/repository.js';

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      repository.setMode(false);
      console.log('MONGO_URI not set, using local JSON storage');
      return false;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    repository.setMode(true);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    repository.setMode(false);
    console.warn(`MongoDB connection error: ${error.message}`);
    console.log('Falling back to local JSON storage');
    return false;
  }
};
