const Task = require('../models/Task');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.listByUser(req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  const { title, priority, category, deadline } = req.body;

  try {
    if (!title) {
      res.status(400);
      return next(new Error('Please add a task title'));
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      priority: priority || 'medium',
      category: category || 'General',
      deadline: deadline || null
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task (title, priority, category, deadline, completed)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  const { title, priority, category, deadline, completed } = req.body;

  try {
    let task = await Task.findByIdForUser(req.params.id, req.user.id);
    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    const wasCompleted = task.completed;
    const updatedTask = await Task.update(req.params.id, req.user.id, {
      title,
      priority,
      category,
      deadline,
      completed,
    });

    // Log activity if completion status changed
    if (completed !== undefined && wasCompleted !== completed) {
      try {
        const { logActivity } = require('../utils/analyticsHelper');
        await logActivity(req.user.id, { tasksCompleted: completed ? 1 : -1 });
      } catch (err) {
        console.error('Error logging task analytics:', err);
      }
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const deleted = await Task.remove(req.params.id, req.user.id);
    if (!deleted) {
      res.status(404);
      return next(new Error('Task not found'));
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};
