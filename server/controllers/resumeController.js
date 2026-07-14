import Resume from '../models/Resume.js';
import { analyzeResume } from '../utils/resumeAnalyzer.js';

export const createResume = async (req, res) => {
  try {
    const { title } = req.body;
    
    // Validate resume name
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Resume name is required' });
    }
    
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      return res.status(400).json({ message: 'Resume name must be at least 3 characters' });
    }
    
    if (trimmedTitle.length > 50) {
      return res.status(400).json({ message: 'Resume name must not exceed 50 characters' });
    }

    const analysis = analyzeResume(req.body);
    const resume = await Resume.create({ 
      ...req.body,
      title: trimmedTitle,
      userId: req.userId,
      qualityScore: analysis.qualityScore,
      atsScore: analysis.atsScore,
      readyToApply: analysis.readyToApply,
      warnings: analysis.warnings
    });
    res.status(201).json(resume);
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ message: 'Error creating resume', error: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resumes' });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume' });
  }
};

export const updateResume = async (req, res) => {
  try {
    const currentResume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!currentResume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Save version history
    const versionSnapshot = {
      version: currentResume.version,
      snapshot: currentResume.toObject(),
      timestamp: new Date(),
      changes: 'Manual update'
    };

    const analysis = analyzeResume(req.body);
    
    // JD matching if provided
    let jdMatch = { matchScore: 0, missingKeywords: [] };
    if (req.body.jobDescription) {
      const { matchJobDescription } = await import('../utils/resumeAnalyzer.js');
      jdMatch = matchJobDescription(req.body, req.body.jobDescription);
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        ...req.body, 
        qualityScore: analysis.qualityScore,
        atsScore: analysis.atsScore,
        readyToApply: analysis.readyToApply,
        warnings: analysis.warnings,
        rejectionReasons: analysis.rejectionReasons || [],
        jdMatchScore: jdMatch.matchScore,
        missingKeywords: jdMatch.missingKeywords || [],
        version: currentResume.version + 1,
        $push: { versionHistory: versionSnapshot },
        updatedAt: Date.now() 
      },
      { new: true }
    );
    
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Error updating resume' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resume' });
  }
};

export const duplicateResume = async (req, res) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!original) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const duplicate = await Resume.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      version: 1,
      versionHistory: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    res.status(201).json(duplicate);
  } catch (error) {
    res.status(500).json({ message: 'Error duplicating resume' });
  }
};

export const matchJobDescription = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const { matchJobDescription: matchJD } = await import('../utils/resumeAnalyzer.js');
    const result = matchJD(resume.toObject(), jobDescription);

    // Update resume with JD data
    await Resume.findByIdAndUpdate(resumeId, {
      jobDescription,
      jdMatchScore: result.matchScore,
      missingKeywords: result.missingKeywords
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error matching job description' });
  }
};
