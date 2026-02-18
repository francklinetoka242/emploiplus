import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { buildApiUrl, authHeaders } from "@/lib/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, MapPin, Globe, LinkIcon, Users, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfileData {
  id: number;
  full_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  profession?: string;
  description?: string;
  profile_image_url?: string;
  user_type: string;
  website?: string;
  company_size?: string;
  sector?: string;
  headquarters?: string;
  mission?: string;
  values?: string;
  benefits?: string;
  linkedin_url?: string;
  twitter_url?: string;
  created_at?: string;
}

interface Publication {
  id: number;
  author_id: number;
  user_type: string;
  full_name?: string;
  company_name?: string;
  profile_image_url?: string;
  content: string;
  image_url?: string;
  category?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

interface OtherUser {
  id: number;
  full_name?: string;
  company_name?: string;
  profession?: string;
  profile_image_url?: string;
  user_type: string;
  location?: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("publications");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl(`/api/users/${userId}`), { headers: authHeaders() });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Utilisateur non trouvé");
          navigate("/");
          return;
        }
        throw new Error(`Erreur ${res.status}`);
      }
      const data = await res.json();
      setUserProfile(data);

      // Fetch publications from this user
      const pubRes = await fetch(buildApiUrl("/api/publications"), { headers: authHeaders() });
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        const pubsArray = Array.isArray(pubData) ? pubData : pubData.publications || [];
        const userPubs = pubsArray.filter((p: Publication) => p.author_id === Number(userId));
        setPublications(userPubs);
      }

      // Fetch other users for sidebar
      const usersRes = await fetch(buildApiUrl("/api/users/candidates?limit=10"), { headers: authHeaders() });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const filteredUsers = (Array.isArray(usersData) ? usersData : [])
          .filter((u: OtherUser) => u.id !== Number(userId))
          .slice(0, 8);
        setOtherUsers(filteredUsers);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Erreur chargement profil:", err);
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Profil non trouvé</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const isCompany = userProfile.user_type === "company";
  const name = isCompany ? userProfile.company_name : userProfile.full_name;
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Back button with header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile (2/3 width on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header card */}
          <Card className="overflow-hidden border-0 shadow-sm">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300"></div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Avatar and main info */}
              <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
                <Avatar className="h-28 w-28 border-4 border-white shadow-md flex-shrink-0">
                  <AvatarImage src={userProfile.profile_image_url} alt={name} />
                  <AvatarFallback className="text-2xl bg-blue-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900">{name}</h1>

                      {/* User type and details */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          {isCompany ? "Entreprise" : "Candidat"}
                        </Badge>
                        {userProfile.profession && !isCompany && (
                          <Badge variant="outline" className="text-slate-600">
                            {userProfile.profession}
                          </Badge>
                        )}
                        {userProfile.sector && isCompany && (
                          <Badge variant="outline" className="text-slate-600">
                            {userProfile.sector}
                          </Badge>
                        )}
                      </div>

                      {/* Location */}
                      {(userProfile.location || userProfile.headquarters) && (
                        <div className="flex items-center gap-2 mt-3 text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">
                            {userProfile.location || userProfile.headquarters}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {userProfile.description && (
                        <p className="text-sm text-slate-700 mt-3">
                          {userProfile.description}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 sm:w-auto">
                      {currentUser?.id !== Number(userId) && (
                        <>
                          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Mail className="h-4 w-4" />
                            Contacter
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Message
                          </Button>
                        </>
                      )}
                      {currentUser?.id === Number(userId) && (
                        <Button onClick={() => navigate("/settings")} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Éditer le profil
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* General info */}
                <Card className="p-4 border border-slate-200">
                  <h3 className="font-semibold text-sm text-slate-900 mb-4">Informations</h3>
                  <div className="space-y-3 text-sm">
                    {userProfile.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="text-slate-900">{userProfile.email}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.phone && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500">Téléphone</p>
                          <p className="text-slate-900">{userProfile.phone}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.website && (
                      <div className="flex items-start gap-3">
                        <LinkIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500">Site web</p>
                          <a
                            href={userProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Visiter
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Company info */}
                {isCompany && (
                  <Card className="p-4 border border-slate-200">
                    <h3 className="font-semibold text-sm text-slate-900 mb-4">Entreprise</h3>
                    <div className="space-y-3 text-sm">
                      {userProfile.sector && (
                        <div>
                          <p className="text-xs text-slate-500">Secteur</p>
                          <p className="text-slate-900">{userProfile.sector}</p>
                        </div>
                      )}
                      {userProfile.company_size && (
                        <div>
                          <p className="text-xs text-slate-500">Taille</p>
                          <p className="text-slate-900">{userProfile.company_size}</p>
                        </div>
                      )}
                      {userProfile.headquarters && (
                        <div>
                          <p className="text-xs text-slate-500">Siège social</p>
                          <p className="text-slate-900">{userProfile.headquarters}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Additional sections */}
              {(userProfile.mission || userProfile.values || userProfile.benefits) && (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {userProfile.mission && (
                    <Card className="p-4 border border-blue-200 bg-blue-50">
                      <h3 className="font-semibold text-sm text-blue-900 mb-2">Mission</h3>
                      <p className="text-sm text-blue-800">{userProfile.mission}</p>
                    </Card>
                  )}
                  {userProfile.values && (
                    <Card className="p-4 border border-slate-200">
                      <h3 className="font-semibold text-sm text-slate-900 mb-2">Valeurs</h3>
                      <p className="text-sm text-slate-700">{userProfile.values}</p>
                    </Card>
                  )}
                  {userProfile.benefits && (
                    <Card className="p-4 border border-slate-200">
                      <h3 className="font-semibold text-sm text-slate-900 mb-2">Avantages</h3>
                      <p className="text-sm text-slate-700">{userProfile.benefits}</p>
                    </Card>
                  )}
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
                <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent h-auto p-0 gap-0">
                  <TabsTrigger
                    value="publications"
                    className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
                  >
                    Publications ({publications.length})
                  </TabsTrigger>
                </TabsList>

                {/* Publications tab */}
                <TabsContent value="publications" className="mt-6">
                  {publications.length === 0 ? (
                    <Card className="p-8 text-center border-dashed border-slate-300">
                      <p className="text-slate-500">
                        Aucune publication pour le moment
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {publications.map((pub) => (
                        <Card key={pub.id} className="p-6 border border-slate-200 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={pub.profile_image_url} />
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {(pub.full_name || pub.company_name || "")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-900">
                                {pub.full_name || pub.company_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(pub.created_at), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </p>
                            </div>
                            {pub.category && (
                              <Badge variant="outline" className="text-xs">{pub.category}</Badge>
                            )}
                          </div>

                          <p className="text-slate-700 whitespace-pre-wrap mb-3">
                            {pub.content}
                          </p>

                          {pub.image_url && (
                            <img
                              src={pub.image_url}
                              alt="Publication"
                              className="w-full h-64 object-cover rounded-lg mb-3"
                            />
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-200">
                            <span>{pub.likes_count || 0} J'aime</span>
                            <span>{pub.comments_count || 0} Commentaires</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>

        {/* Right column - Other users sidebar (1/3 width on lg) */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm overflow-hidden sticky top-20">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">Autres utilisateurs</h2>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {otherUsers.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-500">Aucun autre utilisateur</p>
                </div>
              ) : (
                otherUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/utilisateur/${user.id}`)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={user.profile_image_url} alt={user.full_name || user.company_name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {(user.full_name || user.company_name || "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-blue-600">
                          {user.full_name || user.company_name}
                        </p>
                        {user.profession && (
                          <p className="text-xs text-slate-500 truncate">
                            {user.profession}
                          </p>
                        )}
                        {user.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <p className="text-xs text-slate-500 truncate">
                              {user.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {otherUsers.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <Button
                  variant="outline"
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => navigate("/annuaire")}
                >
                  Voir plus
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
