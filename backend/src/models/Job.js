const { v4: uuidv4 } = require('uuid');

class Job {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description;
    this.requirements = data.requirements || [];
    this.responsibilities = data.responsibilities || [];
    this.location = data.location;
    this.salaryMin = data.salaryMin;
    this.salaryMax = data.salaryMax;
    this.employmentType = data.employmentType; // Full-time, Part-time, Contract, etc.
    this.experienceLevel = data.experienceLevel; // Entry, Mid, Senior, etc.
    this.department = data.department;
    this.companyName = data.companyName;
    this.status = data.status || 'draft'; // draft, published, archived
    this.sourceJD = data.sourceJD || null; // path to uploaded JD file
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.postings = data.postings || []; // array of { platform, status, postedAt, jobUrl, externalId }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      requirements: this.requirements,
      responsibilities: this.responsibilities,
      location: this.location,
      salaryMin: this.salaryMin,
      salaryMax: this.salaryMax,
      employmentType: this.employmentType,
      experienceLevel: this.experienceLevel,
      department: this.department,
      companyName: this.companyName,
      status: this.status,
      sourceJD: this.sourceJD,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      postings: this.postings,
    };
  }
}

module.exports = Job;