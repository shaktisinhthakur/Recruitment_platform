import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { getJobs, getAvailablePlatforms, postJobToPlatforms } from '../services/api';
import JobCard from '../components/JobCard';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [jobsRes, platformsRes] = await Promise.all([getJobs(), getAvailablePlatforms()]);
      setJobs(jobsRes.data.data);
      setPlatforms(platformsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unconfigured = platforms.filter((p) => !p.configured).map((p) => p.name);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recruitment Dashboard</h1>
            <p className="text-gray-600">Manage job postings across LinkedIn, Naukri, Indeed & more.</p>
          </div>
          <Link to="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Job Board Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="p-4 rounded-lg border flex items-center gap-3">
                <div className={`${p.configured ? 'bg-green-100' : 'bg-gray-100`} p-2 rounded`}>
                  {p.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 capitalize">{p.name}</div>
                  <div className={p.configured ? 'text-xs text-green-600' : 'text-xs text-gray-500'}>
                    {p.configured ? 'Configured ✓' : 'Not configured'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {unconfigured.length > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
              The following platforms need API credentials: {unconfigured.join(', ')}. Add them to your backend `.env` file.
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Job Postings</h2>
          </div>
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No jobs yet. <Link to="/post-job" className="text-blue-600 font-medium">Create your first job</Link>.
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onPost={loadData} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">HRMS Recruitment</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Dashboard</Link>
            <Link to="/post-job" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Post New Job</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}