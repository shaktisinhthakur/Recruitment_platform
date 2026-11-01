const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const jobStore = require('../models/JobStore');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed'), false);
  }
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

/**
 * Extract text from uploaded file
 */
exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf8');
    }

    res.json({
      success: true,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
      extractedText: text,
      // Simple heuristic: return first ~500 chars as a preview
      preview: text.substring(0, 500),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Upload JD and auto-create a draft job
 * Body: { title, companyName, location, ... } (optional, will be parsed from text if missing)
 */
exports.uploadAndCreateJob = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf8');
    }

    // Build job from request body + extracted text
    const jobData = {
      title: req.body.title || '',
      description: text,
      requirements: req.body.requirements ? req.body.requirements.split(',').map(s => s.trim()) : [],
      responsibilities: req.body.responsibilities ? req.body.responsibilities.split(',').map(s => s.trim()) : [],
      location: req.body.location || '',
      salaryMin: req.body.salaryMin ? parseInt(req.body.salaryMin, 10) : null,
      salaryMax: req.body.salaryMax ? parseInt(req.body.salaryMax, 10) : null,
      employmentType: req.body.employmentType || '',
      experienceLevel: req.body.experienceLevel || '',
      department: req.body.department || '',
      companyName: req.body.companyName || '',
      status: 'draft',
      sourceJD: `/uploads/${req.file.filename}`,
    };

    const job = jobStore.create(jobData);
    res.status(201).json({
      success: true,
      data: job,
      extractedText: text,
      preview: text.substring(0, 500),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};