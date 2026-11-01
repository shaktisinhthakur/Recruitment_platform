/**
 * BaseJobBoard - Abstract base class for all job board integrations.
 * Each platform extends this class and implements postJob and getJobStatus.
 */
class BaseJobBoard {
  constructor(config = {}) {
    this.config = config;
    this.platformName = 'base';
  }

  /**
   * Validate that required credentials are present
   * @returns {boolean}
   */
  isConfigured() {
    return true;
  }

  /**
   * Post a job to the platform
   * @param {Object} job - Job data
   * @returns {Promise<{success: boolean, jobUrl?: string, externalId?: string, error?: string}>}
   */
  async postJob(job) {
    throw new Error('postJob not implemented');
  }

  /**
   * Get status of a posted job
   * @param {string} externalId - The job ID on the external platform
   * @returns {Promise<{status: string, jobUrl?: string}>}
   */
  async getJobStatus(externalId) {
    throw new Error('getJobStatus not implemented');
  }

  /**
   * Delete/close a job posting
   * @param {string} externalId
   * @returns {Promise<boolean>}
   */
  async closeJob(externalId) {
    throw new Error('closeJob not implemented');
  }
}

module.exports = BaseJobBoard;