const express = require('express');
const { body } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const validate = require('../middleware/validate');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Admin: all projects they own
router.get('/', async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({ owner: req.user._id })
        .populate('members', 'name email role')
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('members', 'name email role')
        .populate('owner', 'name email')
        .sort({ updatedAt: -1 });
    }
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/meta/members-list', requireRole('admin'), async (req, res) => {
  const members = await User.find({ role: 'member' }).select('name email');
  res.json({ members });
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('owner', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    if (req.user.role === 'admin' && !isOwner) {
      return res.status(403).json({ message: 'Not your project' });
    }
    if (req.user.role === 'member' && !isMember) {
      return res.status(403).json({ message: 'You are not on this project' });
    }
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  '/',
  requireRole('admin'),
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('memberIds').optional().isArray(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, description, memberIds = [] } = req.body;
      const members = await User.find({ _id: { $in: memberIds }, role: 'member' });
      const project = await Project.create({
        name,
        description: description || '',
        owner: req.user._id,
        members: members.map((m) => m._id),
      });
      await project.populate('members', 'name email role');
      res.status(201).json({ project });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  '/:id',
  requireRole('admin'),
  [body('name').optional().trim().notEmpty(), body('description').optional().trim()],
  validate,
  async (req, res) => {
    try {
      const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (req.body.name) project.name = req.body.name;
      if (req.body.description !== undefined) project.description = req.body.description;
      await project.save();
      await project.populate('members', 'name email role');
      res.json({ project });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ project: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  '/:id/members',
  requireRole('admin'),
  [body('memberId').notEmpty()],
  validate,
  async (req, res) => {
    try {
      const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      const member = await User.findOne({ _id: req.body.memberId, role: 'member' });
      if (!member) return res.status(400).json({ message: 'Member user not found' });
      if (!project.members.some((id) => id.toString() === member._id.toString())) {
        project.members.push(member._id);
        await project.save();
      }
      await project.populate('members', 'name email role');
      res.json({ project });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete('/:id/members/:memberId', requireRole('admin'), async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.members = project.members.filter((id) => id.toString() !== req.params.memberId);
    await project.save();
    await project.populate('members', 'name email role');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
