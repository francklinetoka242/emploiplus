import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Briefcase, Calendar, ChevronDown, ChevronUp, Clock, Share2, Copy, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { toast } from "sonner";

interface JobItemProps {
  job: Record<string, unknown>;
  isExpanded: boolean;
  onToggle: () => void;
  onApply: () => void;
  onSmartApply?: () => void;
  isSaved?: boolean;
  onSave?: () => void;
}

export function JobListItem({
  job,
  isExpanded,
  onToggle,
  onApply,
  onSmartApply,
  isSaved,
  onSave,
}: JobItemProps) {
  const [fullDescription, setFullDescription] = useState<string>("");
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Truncate description to preview (first 150 characters)
  const getPreviewDescription = () => {
    const desc = String(job.description || "");
    if (desc.length > 150) {
      return desc.substring(0, 150) + "...";
    }
    return desc;
  };

  // Load full description when expanded
  useEffect(() => {
    if (isExpanded && !fullDescription && job.description) {
      setLoadingDescription(true);
      // Simulate lazy loading delay
      setTimeout(() => {
        setFullDescription(String(job.description || ""));
        setLoadingDescription(false);
      }, 300);
    }
  }, [isExpanded, fullDescription, job.description]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareMenu]);

  // Check if deadline is passed
  const isDeadlinePassed = () => {
    const dl = job.deadline_date || job.deadline || null;
    return dl ? new Date(String(dl)).getTime() < Date.now() : false;
  };

  // Format deadline date
  const formatDeadlineDate = () => {
    const dl = job.deadline_date || job.deadline || null;
    if (!dl) return null;
    const date = new Date(String(dl));
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#/emplois/${job.id}` : `/#/emplois/${job.id}`;
  const title = String(job.title || 'Offre');
  const company = String(job.company || '');

  // format a professional message used for WhatsApp and email
  const shareMessage = `📄 *Offre d'emploi trouvée sur Emploi+*
*Poste :* ${title}
*Entreprise :* ${company}
*Lien pour postuler :* ${window.location.origin}/#/jobs/${job.id}/apply
-----------------------------------
🚀 Offres d'emploi consultées sur : www.emploiplus-group.com/#/emplois
📢 Offres gratuites sur WhatsApp : https://whatsapp.com/channel/0029Vb5270VycKAb1tc631
📍 Adresse : Brazzaville, République du Congo
📧 Email : contact@emploiplus-group.com
📞 Contact : +242 06 731 10 33`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Lien copié dans le presse-papiers");
    setShowShareMenu(false);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(shareMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  // Check if application_url exists and is not empty
  const hasApplicationUrl = Boolean(job.application_url && String(job.application_url).trim());

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary hover:border-l-blue-600">
      <CardHeader className="pb-3 bg-white hover:bg-gray-50/50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Job Title */}
            <h3 className="text-lg font-bold line-clamp-2 text-gray-900 hover:text-primary transition-colors">
              {String(job.title || '')}
            </h3>

            {/* Company */}
            {job.company && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{String(job.company)}</span>
              </p>
            )}
          </div>

          {/* Match Score Badge + Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <MatchScoreBadge jobId={Number(job.id)} />
            <div className="flex gap-2">
              {/* Share Button (visible always) */}
              <div className="relative" ref={shareMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="h-10 w-10 p-0 transition-all hover:bg-primary/10"
                  title="Partager cette offre"
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                {/* Share Dropdown Menu */}
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="p-2">
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copier le lien</span>
                      </button>

                      <button
                        onClick={handleShareWhatsApp}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.348l-.355.214-3.68-.965.984 3.595-.235.374a9.86 9.86 0 001.45 5.383c3.02 5.233 9.304 7.973 15.226 6.744 1.401-.33 2.714-.881 3.886-1.622l.342-.214 3.596.981-.942-3.45.236-.374A9.87 9.87 0 0012.051 2a9.858 9.858 0 00-9.52 7.579z" />
                        </svg>
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={handleShareEmail}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 .217L12 11l8-6.783V4H4v.217zM4 6.383v11.234l7.553-5.326L4 6.383zm9.447 5.928L20 17.617V6.383l-6.553 5.928z" />
                        </svg>
                        <span>Email</span>
                      </button>

                      <button
                        onClick={handleShareFacebook}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>Facebook</span>
                      </button>

                      <button
                        onClick={handleShareLinkedIn}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                        <span>LinkedIn</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className={cn(
                    "h-10 w-10 p-0 transition-all",
                    isSaved && "bg-yellow-50 border-yellow-300 text-yellow-600"
                  )}
                  title={isSaved ? "Offre sauvegardée" : "Sauvegarder"}
                >
                  {isSaved ? "★" : "☆"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                className="w-10 h-10 p-0 transition-all hover:bg-primary/10"
                title={isExpanded ? "Voir moins" : "Voir plus"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 bg-gray-50/30">
        {/* Job Details Row */}
        <div className="flex flex-wrap gap-3 text-sm">
          {job.location && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400" />
              {String(job.location)}
            </span>
          )}
          {job.type && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-white ${
              String(job.type).toUpperCase() === "CDI" ? "bg-blue-600" :
              String(job.type).toUpperCase() === "CDD" ? "bg-green-600" :
              String(job.type).toUpperCase().includes("TÉLÉTRAVAIL") ? "bg-purple-600" :
              "bg-gray-600"
            }`}>
              {String(job.type)}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 font-medium">
              💰 {String(job.salary)}
            </span>
          )}
        </div>

        {/* Tags & Metadata */}
        <div className="flex flex-wrap gap-2">
          {job.sector && (
            <Badge className="bg-blue-100 text-blue-800 border-0">{String(job.sector)}</Badge>
          )}
          {job.competence && (
            <Badge variant="outline" className="text-gray-700">{String(job.competence)}</Badge>
          )}
          
          {/* Deadline date display */}
          {(job.deadline_date || job.deadline) && (
            <div className="text-xs">
              {isDeadlinePassed() ? (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                  Date limite dépassée
                </span>
              ) : (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  À candidater avant le {formatDeadlineDate()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description Preview / Full */}
        <div>
          <p className="text-sm text-gray-700">
            {isExpanded ? fullDescription : getPreviewDescription()}
          </p>
          {isExpanded && loadingDescription && (
            <p className="text-xs text-gray-400 mt-2">Chargement...</p>
          )}
        </div>

        {/* Action Buttons */}
        {isExpanded && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              {/* Conditional "Postuler" button - only if application_url exists */}
              {hasApplicationUrl ? (
                <Button 
                  onClick={() => {
                    if (isDeadlinePassed()) {
                      toast.error("Date limite dépassée");
                    } else {
                      window.open(String(job.application_url), '_blank');
                    }
                  }} 
                  disabled={isDeadlinePassed()}
                  className="flex-1 text-sm py-2" 
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Postuler
                </Button>
              ) : (
                <Button 
                  onClick={onApply}
                  disabled={isDeadlinePassed()}
                  className="flex-1 text-sm py-2" 
                  size="sm"
                >
                  Postuler via EmploiPlus
                </Button>
              )}

              {onSmartApply && (
                <Button
                  onClick={onSmartApply}
                  disabled={isDeadlinePassed()}
                  variant="outline"
                  className="flex-1 text-sm py-2"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Candidature Intelligente
                </Button>
              )}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
