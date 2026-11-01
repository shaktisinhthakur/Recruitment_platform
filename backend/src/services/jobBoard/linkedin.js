const axios = require('axios');
const BaseJobBoard = require('./base');

/**
 * LinkedIn Job Posting Integration
 *
 * Documentation: https://docs.microsoft.com/en-us/linkedin/marketing/integrations/ads/job-postings
 *
 * Setup steps:
 * 1. Create a LinkedIn app at https://developer.linkedin.com/
 * 2. Apply for "Marketing Developer Program" access (required for Job Postings API)
 * 3. Get your Client ID, Client Secret
 * 4. Obtain an access token via OAuth 2.0
 * 5. Add LINKEDIN_ACCESS_TOKEN to your .env
 */
class LinkedInJobBoard extends BaseJobBoard {
  constructor(config = {}) {
    super(config);
    this.platformName = 'linkedin';
    this.accessToken = config.accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
    this.apiBase = 'https://api.linkedin.com/v2';
  }

  isConfigured() {
    return !!this.accessToken;
  }

  /**
   * Post a job to LinkedIn
   * Note: LinkedIn's Job Posting API requires partnership approval.
   * This implementation shows the request structure; you may need to adjust
   * based on your LinkedIn API access level.
   */
  async postJob(job) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'LinkedIn access token not configured. Set LINKEDIN_ACCESS_TOKEN in .env',
      };
    }

    try {
      // LinkedIn Job Posting API endpoint (partner-only)
      const url = `${this.apiBase}/jobPostings`;

      const payload = {
        title: job.title,
        company: {
          name: job.companyName || 'Your Company',
        },
        location: {
          country: 'US', // You should map this from job.location
          city: job.location || '',
        },
        description: job.description,
        employmentStatus: this.mapEmploymentType(job.employmentType),
        experienceLevel: this.mapExperienceLevel(job.experienceLevel),
      };

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return {
        success: true,
        externalId: response.data.id || response.data.jobPostingId,
        jobUrl: `https://www.linkedin.com/jobs/view/${response.data.id || response.data.jobPostingId}`,
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
      const response = await axios.get(`${this.apiBase}/jobPostings/${externalId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return {
        status: response.data.status || 'active',
        jobUrl: `https://www.linkedin.com/jobs/view/${externalId}`,
      };
    } catch (err) {
      return { status: 'error', error: err.message };
    }
  }

  mapEmploymentType(type) {
    const map = {
      'Full-time': 'FULL_TIME',
      'Part-time': 'PART_TIME',
      Contract: 'CONTRACT',
      'Freelance': 'FREELANCE',
      Internship: 'INTERNSHIP',
    };
    return map[type] || 'FULL_TIME';
  }

  mapExperienceLevel(level) {
    const map = {
      Entry: 'ENTRY_LEVEL',
      Mid: 'MID_LEVEL',
      Senior: 'SENIOR_LEVEL',
      Executive: 'EXECUTIVE',
    };
    return map[level] || 'MID_LEVEL';
  }
}

module.exports = LinkedInJobBoard;