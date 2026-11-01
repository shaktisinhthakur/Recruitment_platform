const fs = require('fs');
const path = require('path');
const Job = require('./Job');

const DATA_FILE = path.join(__dirname, '../../data/jobs.json');

class JobStore {
  constructor() {
    this.jobs = [];
    this.ensureDataFile();
    this.load();
  }

  ensureDataFile() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  load() {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      this.jobs = parsed.map((j) => new Job(j));
    } catch (err) {
      this.jobs = [];
    }
  }

  save() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.jobs, null, 2));
  }

  findAll() {
    return this.jobs.map((j) => j.toJSON());
  }

  findById(id) {
    return this.jobs.find((j) => j.id === id);
  }

  create(data) {
    const job = new Job(data);
    this.jobs.push(job);
    this.save();
    return job.toJSON();
  }

  update(id, updates) {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index === -1) return null;
    this.jobs[index] = new Job({ ...this.jobs[index].toJSON(), ...updates, updatedAt: new Date().toISOString() });
    this.save();
    return this.jobs[index].toJSON();
  }

  delete(id) {
    const index = this.jobs.findIndex((j) => j.id === id);
    if (index === -1) return false;
    this.jobs.splice(index, 1);
    this.save();
    return true;
  }

  addPosting(jobId, posting) {
    const job = this.findById(jobId);
    if (!job) return null;
    const jobObj = new Job(this.jobs.find((j) => j.id === jobId));
    jobObj.postings.push(posting);
    this.update(jobId, { postings: jobObj.postings });
    return jobObj.toJSON();
  }
}

module.exports = new JobStore();