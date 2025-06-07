const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['painting', 'sculpture', 'photography', 'digital', 'illustration', 'design', 'other']
  },
  medium: {
    type: String,
    trim: true
  },
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'px'],
      default: 'px'
    }
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  projectUrl: {
    type: String,
    trim: true
  },
  tools: [{
    type: String,
    trim: true
  }],
  collaborators: [{
    name: String,
    role: String,
    url: String
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index untuk pencarian
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  category: 'text' 
});

// Pre-save hook untuk memastikan thumbnailUrl
projectSchema.pre('save', function(next) {
  if (!this.thumbnailUrl) {
    this.thumbnailUrl = this.imageUrl;
  }
  next();
});

// Ensure virtuals are included in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema); 