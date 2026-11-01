const axios = require('axios');
const BaseJobBoard = require('./base');

/**
 * Naukri Job Posting Integration
 *
 * Documentation: Contact Naukri for API access (https://www.naukri.com/)
 * Naukri provides recruiter APIs for job posting.
 *
 * Setup steps:
 * 1. Contact Naukri business/sales team for API access
 * 2. Get your API Key and API Secret
 * 3. Add NAUKRI_API_KEY and NAUKRI_API_SECRET to your .env
 */
class NaukriJobBoard extends BaseJobBoard {
  constructor(config = {}) {
    super(config);
    this.platformName = 'naukri';
    this.apiKey = config.apiKey || process.env.NAUKRI_API_KEY;
    this.apiSecret = config.apiSecret || process.env.NAUKRI_API_SECRET;
    this.apiBase = config.apiBase || 'https://api.naukri.com'; // Example endpoint
  }

  isConfigured() {
    return !!this.apiKey && !!this.apiSecret;
  }

  async postJob(job) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Naukri API not configured. Set NAUKRI_API_KEY and NAUKRI_API_SECRET in .env',
      };
    }

    try {
      const url = `${this.apiBase}/v1/jobs`; // Example endpoint - verify with Naukri docs

      const payload = {
        jobTitle: job.title,
        jobDescription: job.description,
        keySkills: (job.requirements || []).join(', '),
        experience: job.experienceLevel || '',
        location: job.location || '',
        salary: job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : '',
        employmentType: job.employmentType || '',
        companyName: job.companyName || '',
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'apiKey': this.apiKey,
          'secretKey': this.apiSecret,
        },
      });

      return {
        success: true,
        externalId: response.data.jobId || response.data.id,
        jobUrl: response.data.jobUrl || `https://www.naukri.com/job-listings-${response.data.jobId}`,
        raw: response.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err.response ? err.response.data : err.message,
      };
    }
  }

  async getJobStatus(externalId) {
    if (!this.isConfigured()) {
      return { status: 'error', error: 'Not configured' };
    }
    try {
      const response = await axios.get(`${this.apiBase}/v1/jobs/${externalId}`, {
        headers: {
          'apiKey': this.apiKey,
          'secretKey': this.apiSecret,
        },
      });
      return {
        status: response.data.status || 'active',
        jobUrl: response.data.jobUrl,
      };
    } catch (err) {
      return { status: 'error', error: err.message };
    }
  }
}

module.exports = NaukriJobBoard;