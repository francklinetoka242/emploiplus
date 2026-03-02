import React, { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/headers';
import { Card } from '@/components/ui/card';
import { Briefcase, Bookmark, Calendar, MapPin, Building, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SaveJobButton from '@/components/jobs/SaveJobButton';

export default function CandidateApplications({ token }: { token: string | null }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const headers: any = {};
        Object.assign(headers, authHeaders());
        
        const [appsRes, savedRes] = await Promise.all([
          fetch('/api/applications', { headers }),
          fetch('/api/saved-jobs', { headers }),
        ]);
        
        if (appsRes.ok) {
          const apps = await appsRes.json();
          setApplications(Array.isArray(apps) ? apps : []);
        }
        
        if (savedRes.ok) {
          const saved = await savedRes.json();
          setSavedJobs(Array.isArray(saved) ? saved : []);
        }
      } catch (e) {
        console.error('Error loading applications/saved jobs', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">
            Mes candidatures ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            Offres enregistrées ({savedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4 mt-6">
          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-muted-foreground">
                Vous n'avez postulé à aucune offre pour le moment.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">{app.job_title || 'Offre'}</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {app.job_company && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{app.job_company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Postulé le {new Date(app.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'validated' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status === 'submitted' && 'En attente'}
                          {app.status === 'validated' && 'Validée'}
                          {app.status === 'accepted' && 'Acceptée'}
                          {app.status === 'declined' && 'Déclinée'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {app.message && (
                        <div className="text-sm bg-gray-50 p-3 rounded mb-3 max-w-xs">
                          <p className="font-medium mb-1">Votre message:</p>
                          <p className="text-gray-700">{app.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4 mt-6">
          {savedJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <Bookmark className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-muted-foreground">
                Vous n'avez enregistré aucune offre pour le moment.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <Card key={job.id} className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">{job.title}</h4>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        {job.company && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Enregistrée le {new Date(job.saved_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap mb-4">
                        {job.type && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">{job.type}</span>}
                        {job.sector && <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">{job.sector}</span>}
                        {job.salary && <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">{job.salary}</span>}
                      </div>

                      {/* Description excerpt */}
                      {job.description && (
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {job.description.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <SaveJobButton jobId={job.id} className="h-10 w-10" />
                      {job.application_url && (
                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Postuler
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
