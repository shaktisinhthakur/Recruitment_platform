const LinkedInJobBoard = require('./linkedin');
const NaukriJobBoard = require('./naukri');
const IndeedJobBoard = require('./indeed');

/**
 * JobBoardManager - Registry of all job board adapters.
 * To add a new platform:
 * 1. Create a new file in this folder extending BaseJobBoard
 * 2. Import it here and add it to the boards map
 * 3. Add required env vars to .env.example
 */
class JobBoardManager {
  constructor() {
    this.boards = new Map();
    this.registerDefaultBoards();
  }

  registerDefaultBoards() {
    this.register('linkedin', new LinkedInJobBoard());
    this.register('naukri', new NaukriJobBoard());
    this.register('indeed', new IndeedJobBoard());
  }

  register(name, board) {
    this.boards.set(name.toLowerCase(), board);
  }

  get(name) {
    return this.boards.get(name.toLowerCase());
  }

  list() {
    return Array.from(this.boards.keys());
  }

  isConfigured(name) {
    const board = this.get(name);
    return board ? board.isConfigured() : false;
  }

  /**
   * Post a job to multiple platforms
   * @param {Array<string>} platforms - platform names
   * @param {Object} job - job data
   * @returns {Promise<Object>} results keyed by platform
   */
  async postToMultiple(platforms, job) {
    const results = {};
    for (const platform of platforms) {
      const board = this.get(platform);
      if (!board) {
        results[platform] = { success: false, error: `Platform '${platform}' not supported` };
        continue;
      }
      results[platform] = await board.postJob(job);
    }
    return results;
  }
}

module.exports = new JobBoardManager();