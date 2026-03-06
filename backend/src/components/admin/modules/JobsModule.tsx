/**
 * Jobs Module
 * Manage job offers with auto-close based on deadline
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Lock } from 'lucide-react';
import { Job } from '../../../types';

interface JobsModuleProps {
  token: string;
}

const JobsModule: React.FC<JobsModuleProps> = ({ token }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary_min: '',
    salary_max: '',
    job_type: 'CDI',
    experience_level: 'Confirmed',
    deadline_date: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // we no longer hardcode a company id; the backend service will assign
        // a company based on a name string (or leave it unset) as appropriate.
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to save');
      await fetchJobs();
      setShowForm(false);
      setFormData({
        title: '', description: '', requirements: '', location: '',
        salary_min: '', salary_max: '', job_type: 'CDI',
        experience_level: 'Confirmed', deadline_date: ''
      });
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette offre?')) return;
    try {
      await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Offres d'Emploi</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-blue-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Titre de l'offre"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Localisation" onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2" />
              <input type="date" value={formData.deadline_date} onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.location}</p>
              </div>
              <div className="flex gap-2">
                {job.is_closed && <Lock size={20} className="text-red-600" />}
              </div>
            </div>
            <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{job.job_type}</span>
                <span>{job.experience_level}</span>
                {job.deadline_date && <span>Deadline: {new Date(job.deadline_date).toLocaleDateString('fr-FR')}</span>}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsModule;
