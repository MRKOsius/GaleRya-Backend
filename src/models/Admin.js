const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  permissions: {
    manageUsers: {
      type: Boolean,
      default: false
    },
    manageProjects: {
      type: Boolean,
      default: true
    },
    manageCategories: {
      type: Boolean,
      default: false
    },
    manageSettings: {
      type: Boolean,
      default: false
    }
  },
  adminInfo: {
    position: String,
    department: String,
    adminSince: {
      type: Date,
      default: Date.now
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Method untuk mengecek permission spesifik
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method untuk mengecek apakah superadmin
adminSchema.methods.isSuperAdmin = function() {
  return this.role === 'superadmin';
};

// Method untuk mengecek apakah admin aktif
adminSchema.methods.isActive = function() {
  return this.status === 'active';
};

module.exports = mongoose.model('Admin', adminSchema); 