import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, minlength: 3, maxlength: 50, trim: true },
  targetRole: { type: String, enum: ['AI/ML Intern', 'Data Analyst', 'Software Engineer', 'General'], default: 'General' },
  template: { type: String, default: 'modern' },
  accentColor: { type: String, default: '#3b82f6' },
  qualityScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  readyToApply: { type: Boolean, default: false },
  jobDescription: { type: String, default: '' },
  jdMatchScore: { type: Number, default: 0 },
  missingKeywords: [String],
  personal_info: {
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    location: String,
    linkedin: String,
    website: String,
    profile_image: String
  },
  professional_summary: { type: String, required: true, minlength: 50 },
  experience: [{
    company: String,
    position: String,
    start_date: String,
    end_date: String,
    is_current: Boolean,
    description: String,
    bullets: [String],
    aiRewritten: { type: Boolean, default: false }
  }],
  education: {
    type: [{
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      field: String,
      graduation_date: String,
      gpa: String
    }],
    validate: [arrayMinLength, 'At least one education entry is required']
  },
  skills: {
    type: [String],
    validate: [arrayMinLength, 'At least 3 skills are required']
  },
  project: {
    type: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      aiRewritten: { type: Boolean, default: false }
    }],
    validate: [arrayMinLength, 'At least one project is required']
  },
  warnings: [String],
  rejectionReasons: [String],
  version: { type: Number, default: 1 },
  versionHistory: [{
    version: Number,
    snapshot: Object,
    timestamp: Date,
    changes: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

function arrayMinLength(val) {
  if (this.skills === val) return val.length >= 3;
  return val.length >= 1;
}

export default mongoose.model('Resume', resumeSchema);
