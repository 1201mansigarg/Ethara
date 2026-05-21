const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    let projectIds = [];

    if (req.user.role === 'admin') {
      const projects = await Project.find({ owner: req.user._id }).select('_id');
      projectIds = projects.map((p) => p._id);
    } else {
      const projects = await Project.find({ members: req.user._id }).select('_id');
      projectIds = projects.map((p) => p._id);
    }

    const baseFilter =
      req.user.role === 'member'
        ? { project: { $in: projectIds }, assignedTo: req.user._id }
        : { project: { $in: projectIds } };

    const [total, todo, inProgress, done, overdueTasks] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'todo' }),
      Task.countDocuments({ ...baseFilter, status: 'in_progress' }),
      Task.countDocuments({ ...baseFilter, status: 'done' }),
      Task.find({
        ...baseFilter,
        status: { $ne: 'done' },
        dueDate: { $lt: now, $ne: null },
      })
        .populate('assignedTo', 'name')
        .populate('project', 'name')
        .sort({ dueDate: 1 })
        .limit(10),
    ]);

    const recentTasks = await Task.find(baseFilter)
      .populate('assignedTo', 'name')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(8);

    res.json({
      stats: {
        projects: projectIds.length,
        tasks: { total, todo, in_progress: inProgress, done },
        overdue: overdueTasks.length,
      },
      overdueTasks,
      recentTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
