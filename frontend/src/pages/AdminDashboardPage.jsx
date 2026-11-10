import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { isToday } from '../utils/helpers';
import InterviewCard from '../components/InterviewCard';
import {
  Users,
  UserCheck,
  CalendarDays,
  BarChart3,
  Plus,
  Calendar,
  UserPlus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    api.getProfiles().then(setProfiles);
    api.getUsers().then(setAllUsers);
    api.getInterviews().then(setInterviews);
  }, []);

  const interviewers = useMemo(() => allUsers.filter((u) => u.role === 'interviewer'), [allUsers]);

  const todayInterviews = interviews.filter((iv) => isToday(iv.date));
  const recentInterviews = [...interviews]
    .sort((a, b) => {
      const da = `${a.date}T${a.time}`;
      const db = `${b.date}T${b.time}`;
      return db.localeCompare(da);
    })
    .slice(0, 5);

  const stats = [
    { label: 'Total Profiles', value: profiles.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Interviewers', value: interviewers.length, icon: UserCheck, color: 'bg-accent/10 text-accent' },
    { label: "Today's Interviews", value: todayInterviews.length, icon: CalendarDays, color: 'bg-warning/10 text-warning' },
    { label: 'Total Interviews', value: interviews.length, icon: BarChart3, color: 'bg-success/10 text-success' },
  ];

  const quickActions = [
    { label: 'Add Profile', icon: Plus, to: '/admin/profiles' },
    { label: 'Schedule Interview', icon: Calendar, to: '/admin/schedule' },
    { label: 'Add Interviewer', icon: UserPlus, to: '/admin/interviewers' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-ink-muted mt-0.5">Overview of interview operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-xs text-ink-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to} className="btn-primary">
            <action.icon className="w-4 h-4" />
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-ink mb-4">Today's Schedule</h2>
          {todayInterviews.length === 0 ? (
            <div className="card text-center py-8">
              <CalendarDays className="w-8 h-8 text-ink-light mx-auto mb-2" />
              <p className="text-sm text-ink-muted">No interviews today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayInterviews
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((iv) => (
                  <InterviewCard
                    key={iv.id}
                    interview={iv}
                    profiles={profiles}
                    users={allUsers}
                    compact
                  />
                ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink mb-4">Recent Interviews</h2>
          {recentInterviews.length === 0 ? (
            <div className="card text-center py-8">
              <BarChart3 className="w-8 h-8 text-ink-light mx-auto mb-2" />
              <p className="text-sm text-ink-muted">No interviews yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInterviews.map((iv) => (
                <InterviewCard
                  key={iv.id}
                  interview={iv}
                  profiles={profiles}
                  users={allUsers}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
