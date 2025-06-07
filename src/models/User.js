const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profile: {
    fullName: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.png'
    },
    coverImage: {
      type: String,
      default: '/images/default-cover.png'
    },
    location: {
      type: String,
      trim: true
    },
    specialization: {
      type: String,
      trim: true
    },
    socialLinks: {
      website: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      behance: String,
      dribbble: String
    }
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual untuk mendapatkan total projects
userSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'createdBy',
  count: true
});

// Method untuk mendapatkan public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.settings;
  delete userObject.email;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 