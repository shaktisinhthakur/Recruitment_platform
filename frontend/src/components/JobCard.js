import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { postJobToPlatforms } from '../services/api';

export default function JobCard({ job, onPost }) {
  const [postingStatus, setPostingStatus] = useState({});

  const platforms = [
    { name: 'linkedin', label: 'LinkedIn' },
    { name: 'naukri', label: 'Naukri' },
    { name: 'indeed', label: 'Indeed' },
  ];

  const handlePost = async (platform) => {
    setPostingStatus((prev) => ({ ...prev, [platform]: 'posting' }));
    try {
      await postJobToPlatforms(job.id, [platform]);
      setPostingStatus((prev) => ({ ...prev, [platform]: 'success' }));
      if (onPost) onPost();
    } catch (err) {
      setPostingStatus((prev) => ({ ...prev, [platform]: 'error' }));
    }
  };

  const posting = (job.postings || []).find((p) => p.platform) || null;

  return (
    <div className="bg-white border rounded-xl p-6 mb-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {job.status}
            </span>
            <span className="text-xs text-gray-500">• {job.employmentType || 'N/A'}</span>
            <span className="text-xs text-gray-500">• {job.experienceLevel || 'N/A'}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600 mt-1">{job.companyName}</p>
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">{job.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(job.requirements || []).slice(0, 3).map((req, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {req}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{job.location}</p>
            {job.salaryMin && job.salaryMax ? (
              <p className="text-sm text-gray-500">${job.salaryMin} - ${job.salaryMax}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            {platforms.map((p) => {
              const status = postingStatus[p.name];
              const alreadyPosted = (job.postings || []).some((x) => x.platform === p.name && x.status === 'posted');
              return (
                <button
                  key={p.name}
                  onClick={() => handlePost(p.name)}
                  disabled={status === 'posting' || alreadyPosted}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                    status === 'posting'
                      ? 'bg-gray-200 text-gray-500 animate-pulse cursor-not-allowed'
                      : alreadyPosted
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {status === 'posting' ? 'Posting...' : alreadyPosted ? 'Posted ✓' : p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {posting && (
        <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">Posted on {posting.platform} at {new Date(posting.postedAt).toLocaleString()}</span>
          {posting.jobUrl && (
            <a href={posting.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
              View Job
            </a>
          )}
        </div>
      )}
    </div>
  );
}