const express = require('express');
const Project = require('../models/Project');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.'), false);
    }
  }
});

// Get all projects with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      featured, 
      userId,
      status = 'published',
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    const query = { status };
    
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (userId) query.createdBy = userId;
    if (search) {
      query.$text = { $search: search };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'username profile')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'username profile');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      tools,
      medium,
      year,
      projectUrl,
      dimensions
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const project = new Project({
      title,
      description,
      imageUrl: `/uploads/${req.file.filename}`,
      thumbnailUrl: `/uploads/${req.file.filename}`, // You might want to generate actual thumbnail
      category,
      tags: tags ? JSON.parse(tags) : [],
      tools: tools ? JSON.parse(tools) : [],
      medium,
      year: parseInt(year),
      projectUrl,
      dimensions: dimensions ? JSON.parse(dimensions) : undefined,
      createdBy: req.user.id
    });

    const savedProject = await project.save();
    await savedProject.populate('createdBy', 'username profile');
    
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project
router.patch('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin
    if (project.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('createdBy', 'username profile');

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin
    if (project.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle featured status (admin only)
router.post('/:id/featured', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.featured = !project.featured;
    await project.save();

    res.json({ featured: project.featured });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 