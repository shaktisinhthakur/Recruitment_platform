# HRMS - Recruitment Module

A complete recruitment module for your HRMS that lets you upload Job Descriptions (JD), extract text from them, create job postings, and publish directly to **LinkedIn**, **Naukri**, **Indeed**, and any other job board.

## 📁 Project Structure

```
HRMS/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── app.js           # Express app entry point
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   │   ├── jobController.js
│   │   │   └── uploadController.js
│   │   ├── models/          # Data models
│   │   │   ├── Job.js
│   │   │   └── JobStore.js
│   │   ├── routes/          # API routes
│   │   │   ├── jobRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── middleware/      # Joi validation
│   │   │   └── validation.js
│   │   └── services/
│   │       └── jobBoard/    # Job board adapters
│   │           ├── base.js          # Abstract base class
│   │           ├── linkedin.js      # LinkedIn adapter
│   │           ├── naukri.js        # Naukri adapter
│   │           ├── indeed.js        # Indeed adapter
│   │           └── index.js         # Job board manager/registry
│   ├── uploads/             # Uploaded JD files
│   ├── data/                # JSON database (jobs.json)
│   ├── package.json
│   └── .env                 # Copy from .env.example and fill in keys
├── frontend/                # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── api.js           # API service layer
│   │   ├── components/
│   │   │   ├── Navbar.js

## 🔗 Integration Guide: LinkedIn, Naukri, Indeed

This project uses the **Adapter Pattern**. Each job board has its own class that extends `BaseJobBoard`. To add a new platform, just create a new adapter file and register it.

### How It Works

1. User uploads a JD (PDF/DOCX/TXT) → text is extracted (`pdf-parse` for PDF, `mammoth` for DOCX)
2. User fills in job details (title, location, salary, etc.)
3. User selects which platforms to post to
4. The `JobBoardManager` iterates over selected platforms and calls each adapter's `postJob()`
5. Results (success/failure, external job ID, job URL) are saved to the job record

### LinkedIn Integration

**API:** LinkedIn Job Postings API (part of LinkedIn Marketing Developer Platform)

**Steps to get access:**

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new LinkedIn App
3. Apply for the **Marketing Developer Program** (required for Job Postings API)
4. Once approved, get your access token via OAuth 2.0
5. Add `LINKEDIN_ACCESS_TOKEN` to your `.env`

**Adapter:** `backend/src/services/jobBoard/linkedin.js`

The adapter posts to `https://api.linkedin.com/v2/jobPostings`. Note: LinkedIn's Job Posting API is partner-only — you must be approved in the Marketing Developer Program. The code shows the correct request structure; adjust field mappings based on your LinkedIn API access level.

### Naukri Integration

**API:** Naukri Recruiter API

**Steps to get access:**

1. Contact Naukri business/sales team for API access
2. Get your API Key and API Secret
3. Add `NAUKRI_API_KEY` and `NAUKRI_API_SECRET` to your `.env`

**Adapter:** `backend/src/services/jobBoard/naukri.js`

The example uses `https://api.naukri.com/v1/jobs` — verify the exact endpoint and request format with Naukri's API documentation, as it may vary by account tier.

### Indeed Integration

**API:** Indeed Employer API / Publisher API

**Steps to get access:**

1. Sign up at [Indeed Publisher](https://www.indeed.com/publisher)
2. Get your Publisher ID and API Key
3. Add `INDEED_PUBLISHER_ID` and `INDEED_API_KEY` to your `.env`

**Adapter:** `backend/src/services/jobBoard/indeed.js`


## 🛠 Adding a New Job Board Platform

To integrate any additional platform (Monster, Glassdoor, ZipRecruiter, etc.):

### Step 1: Create the adapter

Create `backend/src/services/jobBoard/<platform>.js`:

```javascript
const axios = require('axios');
const BaseJobBoard = require('./base');

class <Platform>JobBoard extends BaseJobBoard {
  constructor(config = {}) {
    super(config);
    this.platformName = '<platform>';
    this.apiKey = config.apiKey || process.env.<PLATFORM>_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async postJob(job) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Not configured' };
    }
    try {
      const response = await axios.post('<API_ENDPOINT>', {
        title: job.title,
        description: job.description,
        // ... map your fields
      }, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return {
        success: true,
        externalId: response.data.id,
        jobUrl: response.data.jobUrl,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getJobStatus(externalId) {
    return { status: 'active' };
  }
}

module.exports = <Platform>JobBoard;
```

### Step 2: Register it

Edit `backend/src/services/jobBoard/index.js`:

```javascript
const <Platform>JobBoard = require('./<platform>');

class JobBoardManager {
  constructor() {
    this.boards = new Map();
    this.registerDefaultBoards();
  }

  registerDefaultBoards() {
    this.register('linkedin', new LinkedInJobBoard());
    this.register('naukri', new NaukriJobBoard());
    this.register('indeed', new IndeedJobBoard());
    this.register('<platform>', new <Platform>JobBoard());
  }
  // ...
}
```

### Step 3: Add env vars

Add your platform's API keys to `.env.example` and `.env`.

### Step 4: Frontend

The frontend automatically picks up platforms from `GET /api/jobs/platforms`, so no frontend changes are needed — the new platform will appear as a checkbox in the "Select Platforms" step.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get a single job |
| POST | `/api/jobs` | Create a job (draft) |
| PUT | `/api/jobs/:id` | Update a job |
| DELETE | `/api/jobs/:id` | Delete a job |
| POST | `/api/jobs/:id/post` | Post job to platforms (`{ platforms: [...] }`) |
| GET | `/api/jobs/platforms` | List available job boards + config status |
| POST | `/api/upload/jd` | Upload JD and extract text |
| POST | `/api/upload/jd/create-job` | Upload JD + create draft job |

## 📋 Features Included

- ✅ Upload JD (PDF, DOCX, TXT) with automatic text extraction
- ✅ Create job postings from extracted JD text
- ✅ Post to LinkedIn, Naukri, Indeed simultaneously
- ✅ Per-platform posting status tracking
- ✅ Adapter pattern — add new platforms in minutes
- ✅ Platform configuration status dashboard
- ✅ React frontend with Tailwind CSS
- ✅ File-based JSON storage (no database setup required)

## ⚠️ Important Notes

1. **API Approvals:** LinkedIn, Naukri, and Indeed all require you to apply for API access before you can post jobs programmatically. The adapters will return a "Not configured" error until you add valid credentials.

2. **Rate Limits:** Each platform has its own rate limits. The adapters don't implement retry logic — add that if needed for production.

3. **Sandbox Mode:** Some platforms offer sandbox/test environments. Use those for development before going live.

4. **Job Mapping:** Field mappings (employment type, experience level, etc.) may differ between platforms. Adjust the mapping functions in each adapter to match the platform's expected values.

## 🧠 Architecture Decisions

- **Adapter Pattern:** Each platform is isolated in its own class. Adding/removing platforms doesn't affect other code.
- **JSON File Storage:** `JobStore` uses a simple JSON file for zero-configuration setup. Swap for MongoDB/PostgreSQL in production.
- **Multipart JD Upload:** The frontend sends the JD file + job fields as `multipart/form-data`, allowing the backend to extract text and create a job in one request.

## 📝 Next Steps (Production Ready)

- Add user authentication (JWT)
- Replace JSON file with MongoDB or PostgreSQL
- Add resume parsing and candidate matching
- Add email notifications for applicants
- Add application tracking dashboard
- Implement retry logic and rate limiting for job board APIs
- Add webhook support for platform status callbacks
The example uses `https://api.indeed.com/ads/jobs`. Verify the exact endpoint with Indeed's employer API documentation.
│   │   │   └── JobCard.js
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       └── PostJob.js
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys (see Integration Guide below)
npm run dev
```

The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000` (via Create React App).

### 3. Environment Variables

Create `backend/.env` from `.env.example`:

```env
PORT=5000
NODE_ENV=development

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token

# Naukri
NAUKRI_API_KEY=your_naukri_api_key
NAUKRI_API_SECRET=your_naukri_api_secret

# Indeed
INDEED_PUBLISHER_ID=your_indeed_publisher_id
INDEED_API_KEY=your_indeed_api_key
```