/**
 * Trainings Module
 * Manage training programs and courses
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Training } from '../../../types';

interface TrainingsModuleProps {
  token: string;
}

const TrainingsModule: React.FC<TrainingsModuleProps> = ({ token }) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTrainings();
  }, [token]);

  const fetchTrainings = async () => {
    try {
      const response = await fetch('/api/admin/trainings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch trainings');
      const data = await response.json();
      setTrainings(data);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette formation?')) return;
    try {
      await fetch(`/api/admin/trainings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTrainings();
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Formations</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => (
          <div key={training.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{training.title}</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>Fournisseur: {training.provider || 'N/A'}</p>
              <p>Niveau: {training.level || 'N/A'}</p>
              <p>Durée: {training.duration || 'N/A'}</p>
              {training.certification && <p>✓ Certification incluse</p>}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 text-blue-600 hover:bg-blue-50 py-1 rounded"><Edit size={16} /></button>
              <button
                onClick={() => handleDelete(training.id)}
                className="flex-1 text-red-600 hover:bg-red-50 py-1 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingsModule;
