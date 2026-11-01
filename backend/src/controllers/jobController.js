const jobStore = require('../models/JobStore');
const jobBoardManager = require('../services/jobBoard');
const { jobSchema, postingSchema } = require('../middleware/validation');

/**
 * GET /api/jobs - List all jobs
 */
exports.getAllJobs = (req, res) => {
  const jobs = jobStore.findAll();
  res.json({ success: true, count: jobs.length, data: jobs });
};

/**
 * GET /api/jobs/:id - Get a single job
 */
exports.getJobById = (req, res) => {
  const job = jobStore.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  res.json({ success: true, data: job });
};

/**
 * POST /api/jobs - Create a new job (draft)
 */
exports.createJob = (req, res) => {
  const { error, value } = jobSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  const job = jobStore.create(value);
  res.status(201).json({ success: true, data: job });
};

/**
 * PUT /api/jobs/:id - Update a job
 */
exports.updateJob = (req, res) => {
  const { error, value } = jobSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  const job = jobStore.update(req.params.id, value);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  res.json({ success: true, data: job });
};

/**
 * DELETE /api/jobs/:id - Delete a job
 */
exports.deleteJob = (req, res) => {
  const deleted = jobStore.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  res.json({ success: true, message: 'Job deleted' });
};

/**
 * POST /api/jobs/:id/post - Post a job to selected platforms
 * Body: { platforms: ['linkedin', 'naukri', 'indeed'] }
 */
exports.postJobToPlatforms = async (req, res) => {
  const job = jobStore.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }

  const { platforms } = req.body;
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ success: false, error: 'platforms array is required' });
  }

  try {
    const results = await jobBoardManager.postToMultiple(platforms, job);

    // Save posting results to the job record
    const postings = platforms.map((platform) => {
      const r = results[platform];
      return {
        platform,
        status: r.success ? 'posted' : 'failed',
        postedAt: new Date().toISOString(),
        jobUrl: r.jobUrl || null,
        externalId: r.externalId || null,
        error: r.error || null,
      };
    });

    const updated = jobStore.update(req.params.id, {
      status: 'published',
      postings: [...(job.postings || []), ...postings],
    });

    res.json({
      success: true,
      data: updated,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/jobs/platforms - List available job boards and their config status
 */
exports.getAvailablePlatforms = (req, res) => {
  const platforms = jobBoardManager.list().map((name) => ({
    name,
    configured: jobBoardManager.isConfigured(name),
  }));
  res.json({ success: true, data: platforms });
};