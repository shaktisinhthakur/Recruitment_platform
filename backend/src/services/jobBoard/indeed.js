const axios = require('axios');
const BaseJobBoard = require('./base');

/**
 * Indeed Job Posting Integration
 *
 * Documentation: https://developer.indeed.com/
 *
 * Setup steps:
 * 1. Sign up for Indeed Publisher/Employer program at https://www.indeed.com/publisher
 * 2. Get your Publisher ID and API Key
 * 3. Add INDEED_PUBLISHER_ID and INDEED_API_KEY to your .env
 */
class IndeedJobBoard extends BaseJobBoard {
  constructor(config = {}) {
    super(config);
    this.platformName = 'indeed';
    this.publisherId = config.publisherId || process.env.INDEED_PUBLISHER_ID;
    this.apiKey = config.apiKey || process.env.INDEED_API_KEY;
    this.apiBase = 'https://api.indeed.com';
  }

  isConfigured() {
    return !!this.publisherId && !!this.apiKey;
  }

  async postJob(job) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Indeed API not configured. Set INDEED_PUBLISHER_ID and INDEED_API_KEY in .env',
      };
    }

    try {
      const url = `${this.apiBase}/ads/jobs`;

      const payload = {
        publisher: this.publisherId,
        jobtitle: job.title,
        jobdescription: job.description,
        location: job.location || '',
        company: job.companyName || '',
        salary: job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : '',
        jobtype: job.employmentType || 'fulltime',
        experience: job.experienceLevel || '',
        source: 'HRMS',
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return {
        success: true,
        externalId: response.data.jobId || response.data.id,
        jobUrl: response.data.jobUrl || `https://www.indeed.com/viewjob?jk=${response.data.jobId}`,
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
      const response = await axios.get(`${this.apiBase}/ads/jobs/${externalId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

module.exports = IndeedJobBoard;