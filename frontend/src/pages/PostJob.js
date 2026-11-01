import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, ArrowLeft } from 'lucide-react';
import {
  uploadJDAndCreateJob,
  createJob,
  postJobToPlatforms,
} from '../services/api';

export default function PostJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [form, setForm] = useState({
    title: '',
    companyName: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    department: '',
    requirements: '',
    responsibilities: '',
    description: '',
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const platforms = [
    { name: 'linkedin', label: 'LinkedIn' },
    { name: 'naukri', label: 'Naukri' },
    { name: 'indeed', label: 'Indeed' },
  ];

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUploadJD = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadJDAndCreateJob(file, form);
      setExtractedText(res.data.extractedText || '');
      setForm((prev) => ({
        ...prev,
        title: res.data.data.title || prev.title,
        description: res.data.data.description || prev.description,
        companyName: res.data.data.companyName || prev.companyName,
        location: res.data.data.location || prev.location,
      }));
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const jobRes = await createJob(form);
      const job = jobRes.data.data;
      if (selectedPlatforms.length > 0) {
        await postJobToPlatforms(job.id, selectedPlatforms);
      }
      setMessage({ type: 'success', text: 'Job created and posted successfully!' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (name) => {
    setSelectedPlatforms((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">HRMS Recruitment</span>
            </div>
            <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">Back to Dashboard</a>
          </div>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="border-b p-6">
            <h1 className="text-xl font-bold text-gray-900">
              {step === 1 ? 'Upload Job Description' : step === 2 ? 'Job Details' : 'Select Platforms'}
            </h1>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 w-12 rounded-full transition ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
          <div className="p-6">
            {step === 1 && (
              <div className="text-center py-10">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 inline-block">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Click to upload JD (PDF, DOCX, TXT)</p>
                  <input type="file" className="hidden" id="jd-file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} />
                  <label htmlFor="jd-file" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Choose File
                  </label>
                </div>
                {file && (
                  <div className="mt-6 text-left w-full max-w-md mx-auto">
                    <p className="text-sm text-gray-500">{file.name}</p>
                  </div>
                )}
                <button
                  onClick={handleUploadJD}
                  disabled={loading || !file}
                  className={`mt-6 px-6 py-2 rounded-md text-sm font-medium transition ${!file || loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {loading ? 'Extracting...' : 'Extract Text from JD'}
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                      <option>Entry</option>
                      <option>Mid</option>
                      <option>Senior</option>
                      <option>Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min</label>
                  <input type="number" className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max</label>
                  <input type="number" className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                  <textarea className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (comma separated)</label>
                  <textarea className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={2} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows={4} value={form.description || extractedText} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                {extractedText && (
                  <div className="bg-blue-50 p-3 rounded text-sm border border-blue-100">
                    <p className="text-blue-800 font-medium mb-1">Extracted from JD:</p>
                    <p className="text-blue-600 line-clamp-2">{extractedText.substring(0, 300)}...</p>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <button type="button" onClick={handleBack} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Creating...' : 'Next: Select Platforms'}
                  </button>
                </div>
              </form>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600">Select where to post this job:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {platforms.map((p) => (
                    <label
                      key={p.name}
                      className={`p-4 rounded border flex items-center gap-3 cursor-pointer transition ${
                        selectedPlatforms.includes(p.name)
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedPlatforms.includes(p.name)}
                        onChange={() => togglePlatform(p.name)}
                      />
                      <span className="font-medium text-gray-900 capitalize">{p.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={handleBack} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Posting...' : 'Create & Post Job'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="border-t p-4 bg-gray-50 text-xs text-gray-500 text-center">
            Note: Add API credentials for LinkedIn, Naukri, Indeed in your backend `.env` before posting.
          </div>
        </div>
      </div>
    </div>
  );
}