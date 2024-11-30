// /routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
// Middleware to authenticate user
console.log({
  rt: "taksJs",
  JWT_SECRET,
})

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Create Task
router.post('/', authenticate, async (req, res) => {
  const { title, description, priority, deadline } = req.body;

  try {
    const task = new Task({
      userId: req.user.id,
      title,
      description,
      priority,
      deadline
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Error creating task' });
  }
});

// Get Tasks (with filtering and search)
router.get('/', authenticate, async (req, res) => {
  const { priority, dueDate, search } = req.query;

  try {
    const filter = { userId: req.user.id };

    if (priority) filter.priority = priority;
    if (dueDate) filter.deadline = { $lte: new Date(dueDate) };
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving tasks' });
  }
});

// Update Task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Error updating task' });
  }
});

// Delete Task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

module.exports = router;
