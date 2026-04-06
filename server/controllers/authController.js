import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { repository } from '../data/repository.js';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'taskflow-dev-secret', { expiresIn: '7d' });

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await repository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await repository.createUser({ name, email: normalizedEmail, password: hashedPassword });

  await repository.createBoard({
    name: `${name.split(' ')[0]}'s Workspace`,
    owner: user._id
  });

  res.status(201).json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email }
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await repository.findUserByEmail(email.toLowerCase().trim());
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  res.json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email }
  });
};

export const getMe = async (req, res) => {
  const user = await repository.findUserById(req.user.id);
  res.json(user);
};
