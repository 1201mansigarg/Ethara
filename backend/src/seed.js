require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seed = async () => {
  await connectDB();
  await Promise.all([Task.deleteMany(), Project.deleteMany(), User.deleteMany()]);

  const admin = await User.create({
    name: 'Ram Kumar',
    email: 'admin@workdesk.io',
    password: 'admin123',
    role: 'admin',
  });

  const m1 = await User.create({
    name: 'Riya Bansal',
    email: 'riya@workdesk.io',
    password: 'member123',
    role: 'member',
  });

  const m2 = await User.create({
    name: 'Shyam Nair',
    email: 'shyam@workdesk.io',
    password: 'member123',
    role: 'member',
  });

  const project = await Project.create({
    name: 'Website Redesign',
    description: 'Q2 marketing site refresh',
    owner: admin._id,
    members: [m1._id, m2._id],
  });

  const dueSoon = new Date();
  dueSoon.setDate(dueSoon.getDate() + 3);
  const overdue = new Date();
  overdue.setDate(overdue.getDate() - 2);

  await Task.insertMany([
    {
      title: 'Homepage wireframes',
      description: 'Low-fi layouts for review',
      project: project._id,
      assignedTo: m1._id,
      createdBy: admin._id,
      status: 'in_progress',
      dueDate: dueSoon,
    },
    {
      title: 'Copy audit',
      project: project._id,
      assignedTo: m2._id,
      createdBy: admin._id,
      status: 'todo',
      dueDate: overdue,
    },
    {
      title: 'Deploy staging',
      project: project._id,
      assignedTo: m1._id,
      createdBy: admin._id,
      status: 'done',
      dueDate: overdue,
    },
  ]);

  console.log('Seed done.');
  await mongoose.disconnect();
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
