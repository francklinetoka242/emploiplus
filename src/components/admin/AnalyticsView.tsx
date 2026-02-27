import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown, Users, Briefcase } from "lucide-react";

// Mock data - en production, ces données viendront du backend
const mockTrendData = [
  { date: "01/01", users: 150, applications: 45, jobs: 12 },
  { date: "05/01", users: 180, applications: 65, jobs: 18 },
  { date: "10/01", users: 210, applications: 90, jobs: 25 },
  { date: "15/01", users: 250, applications: 120, jobs: 32 },
  { date: "20/01", users: 280, applications: 155, jobs: 40 },
  { date: "25/01", users: 320, applications: 195, jobs: 48 },
  { date: "31/01", users: 350, applications: 240, jobs: 55 },
];

const mockConversionData = [
  { week: "Semaine 1", conversion: 22, bounce: 78 },
  { week: "Semaine 2", conversion: 28, bounce: 72 },
  { week: "Semaine 3", conversion: 35, bounce: 65 },
  { week: "Semaine 4", conversion: 42, bounce: 58 },
];

export const AnalyticsView = () => {
  const [dateRange, setDateRange] = useState("month");

  const metrics = [
    {
      label: "Croissance utilisateurs",
      value: "+23.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Taux de candidature",
      value: "+42.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Taux de conversion",
      value: "+18.3%",
      trend: "up",
      icon: Briefcase,
      color: "text-orange-600",
    },
    {
      label: "Temps moyen session",
      value: "4m 32s",
      trend: "up",
      icon: TrendingDown,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Rapports</h2>
        <div className="flex gap-2">
          <Button
            variant={dateRange === "week" ? "default" : "outline"}
            onClick={() => setDateRange("week")}
          >
            Semaine
          </Button>
          <Button
            variant={dateRange === "month" ? "default" : "outline"}
            onClick={() => setDateRange("month")}
          >
            Mois
          </Button>
          <Button
            variant={dateRange === "year" ? "default" : "outline"}
            onClick={() => setDateRange("year")}
          >
            Année
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold mt-2">{metric.value}</p>
                  <p className={`text-sm mt-2 font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend === 'up' ? '↑' : '↓'} par rapport au mois dernier
                  </p>
                </div>
                <Icon className={`h-12 w-12 opacity-20 ${metric.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Tendances utilisateurs et candidatures
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={mockTrendData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorUsers)"
              name="Utilisateurs"
            />
            <Area
              type="monotone"
              dataKey="applications"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorApps)"
              name="Candidatures"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Conversion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Taux de conversion hebdomadaire</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockConversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversion" fill="#10b981" name="Conversion %" />
              <Bar dataKey="bounce" fill="#f59e0b" name="Bounce %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Performance des offres</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Offres actives</span>
                <span className="text-sm font-bold">48</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Candidatures reçues</span>
                <span className="text-sm font-bold">240</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Taux de remplissage moyen</span>
                <span className="text-sm font-bold">5.0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Formations actives</span>
                <span className="text-sm font-bold">12</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Top 5 offres (par candidatures)</h3>
        <div className="space-y-3">
          {[
            { title: "Développeur Full Stack", company: "TechCorp", apps: 45, color: "bg-blue-100" },
            { title: "Designer UX/UI", company: "Creative Studio", apps: 38, color: "bg-purple-100" },
            { title: "Manager Commercial", company: "Sales Inc", apps: 32, color: "bg-green-100" },
            { title: "Responsable Marketing", company: "Digital Agency", apps: 28, color: "bg-orange-100" },
            { title: "Data Scientist", company: "AI Labs", apps: 25, color: "bg-pink-100" },
          ].map((job, index) => (
            <div key={index} className={`p-4 rounded-lg ${job.color} flex items-center justify-between`}>
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{job.apps}</p>
                <p className="text-xs text-muted-foreground">candidatures</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsView;
