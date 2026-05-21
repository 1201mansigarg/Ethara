const express = require('express');
const { body } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const canAccessProject = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  if (user.role === 'admin' && project.owner.toString() === user._id.toString()) return project;
  if (user.role === 'member' && project.members.some((id) => id.toString() === user._id.toString())) {
    return project;
  }
  return false;
};

router.get('/', async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let filter = {};

    if (req.user.role === 'admin') {
      const owned = await Project.find({ owner: req.user._id }).select('_id');
      filter.project = { $in: owned.map((p) => p._id) };
    } else {
      const joined = await Project.find({ members: req.user._id }).select('_id');
      filter.project = { $in: joined.map((p) => p._id) };
      filter.assignedTo = req.user._id;
    }

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1, updatedAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  '/',
  requireRole('admin'),
  [
    body('title').trim().notEmpty(),
    body('project').notEmpty(),
    body('description').optional().trim(),
    body('assignedTo').optional(),
    body('dueDate').optional().isISO8601(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
  ],
  validate,
  async (req, res) => {
    try {
      const project = await canAccessProject(req.body.project, req.user);
      if (!project) return res.status(403).json({ message: 'Invalid project' });

      if (req.body.assignedTo) {
        const member = await User.findOne({
          _id: req.body.assignedTo,
          role: 'member',
        });
        const onTeam = project.members.some((id) => id.toString() === member?._id?.toString());
        if (!member || !onTeam) {
          return res.status(400).json({ message: 'Assignee must be a project member' });
        }
      }

      const task = await Task.create({
        title: req.body.title,
        description: req.body.description || '',
        project: req.body.project,
        assignedTo: req.body.assignedTo || null,
        createdBy: req.user._id,
        status: req.body.status || 'todo',
        dueDate: req.body.dueDate || null,
      });

      await task.populate(['assignedTo', 'project', 'createdBy']);
      res.status(201).json({ task });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('assignedTo').optional(),
    body('dueDate').optional(),
  ],
  validate,
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate('project');
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const project = await Project.findById(task.project._id || task.project);
      const isAdminOwner =
        req.user.role === 'admin' && project.owner.toString() === req.user._id.toString();
      const isAssignedMember =
        req.user.role === 'member' &&
        task.assignedTo?.toString() === req.user._id.toString();

      if (!isAdminOwner && !isAssignedMember) {
        return res.status(403).json({ message: 'Cannot edit this task' });
      }

      if (isAssignedMember) {
        if (req.body.status) task.status = req.body.status;
      } else {
        if (req.body.title) task.title = req.body.title;
        if (req.body.description !== undefined) task.description = req.body.description;
        if (req.body.status) task.status = req.body.status;
        if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || null;
        if (req.body.assignedTo !== undefined) {
          if (req.body.assignedTo) {
            const member = await User.findById(req.body.assignedTo);
            const onTeam = project.members.some((id) => id.toString() === member?._id?.toString());
            if (!member || member.role !== 'member' || !onTeam) {
              return res.status(400).json({ message: 'Invalid assignee' });
            }
          }
          task.assignedTo = req.body.assignedTo || null;
        }
      }

      await task.save();
      await task.populate(['assignedTo', 'project', 'createdBy']);
      res.json({ task });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
