import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { formatDate, formatTime, isToday as isTodayStr, getRoundColor, getStatusColor } from '../utils/helpers';
import { format, isToday } from 'date-fns';
import Calendar from '../components/Calendar';
import InterviewCard from '../components/InterviewCard';
import { CalendarDays, ExternalLink, Clock, Timer, UserCircle, X } from 'lucide-react';

function getMinutesUntil(timeStr) {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return Math.round((target - now) / 60000);
}

function formatCountdown(minutes) {
  if (minutes < 0) return 'Started';
  if (minutes === 0) return 'Starting now';
  if (minutes < 60) return `in ${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `in ${hrs}h`;
  return `in ${hrs}h ${mins}m`;
}

function countdownColor(minutes) {
  if (minutes < 0) return 'text-ink-muted';
  if (minutes <= 10) return 'text-danger';
  if (minutes <= 30) return 'text-warning';
  if (minutes <= 120) return 'text-primary';
  return 'text-accent';
}

function ProfileQuickModal({ profile, onClose }) {
  if (!profile) return null;
  const fields = [
    { label: 'Full Name', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: "Father's Name", value: profile.fatherName },
    { label: "Mother's Name", value: profile.motherName },
    { label: 'Date of Birth', value: profile.dob },
    { label: 'Education', value: profile.education },
    { label: 'Passout Year', value: profile.passoutYear },
    { label: 'Experience', value: profile.experience },
    { label: 'Skills', value: profile.skills },
    { label: 'Aadhaar', value: profile.aadhaar },
    { label: 'PAN', value: profile.pan },
    { label: 'Current Company', value: profile.currentCompany },
    { label: 'Designation', value: profile.designation },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-card flex items-center justify-between px-5 py-4 border-b border-border z-10">
          <div className="flex items-center gap-2">
            <UserCircle size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-ink">{profile.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <p className="text-xs text-ink-muted mb-0.5">{f.label}</p>
              <p className="text-sm font-medium text-ink">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MySchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [, setTick] = useState(0);
  const [viewingProfile, setViewingProfile] = useState(null);

  const [interviews, setInterviews] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.getInterviews(user.id).then(setInterviews);
    api.getProfiles().then(setProfiles);
    api.getUsers().then(setUsers);
  }, [user.id, refreshKey]);

  const todayInterviews = useMemo(
    () => interviews.filter((iv) => isTodayStr(iv.date)).sort((a, b) => a.time.localeCompare(b.time)),
    [interviews]
  );

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedInterviews = useMemo(
    () => interviews.filter((iv) => iv.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time)),
    [interviews, selectedDateStr]
  );

  const getProfile = (profileId) => profiles.find((pr) => pr.id === profileId) || null;
  const getProfileName = (profileId) => getProfile(profileId)?.name || 'Unknown';

  const upcomingToday = todayInterviews.filter((iv) => {
    const mins = getMinutesUntil(iv.time);
    return mins >= -60 && iv.status === 'Scheduled';
  });

  const timeSlots = useMemo(() => {
    if (selectedInterviews.length === 0) return [];
    const slots = {};
    selectedInterviews.forEach((iv) => {
      const hour = parseInt(iv.time.split(':')[0], 10);
      if (!slots[hour]) slots[hour] = [];
      slots[hour].push(iv);
    });
    return Object.entries(slots)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([hour, ivs]) => ({
        hour: Number(hour),
        label: `${Number(hour) % 12 || 12}:00 ${Number(hour) >= 12 ? 'PM' : 'AM'}`,
        interviews: ivs,
      }));
  }, [selectedInterviews]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Schedule</h1>
          <p className="text-ink-muted mt-0.5">Welcome, {user.name}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-4 py-2.5">
          <CalendarDays className="w-5 h-5" />
          <span className="text-sm font-medium">{todayInterviews.length} interview{todayInterviews.length !== 1 ? 's' : ''} today</span>
        </div>
      </div>

      {upcomingToday.length > 0 && (
        <div className="card border-primary/30 bg-primary/5">
          <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Upcoming Today
          </h2>
          <div className="space-y-2">
            {upcomingToday.map((iv) => {
              const mins = getMinutesUntil(iv.time);
              const profile = getProfile(iv.profileId);
              return (
                <div key={iv.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-border gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`text-xs font-bold whitespace-nowrap ${countdownColor(mins)}`}>
                      {formatCountdown(mins)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-ink">{getProfileName(iv.profileId)}</span>
                        <span className={`badge text-xs ${getRoundColor(iv.round)}`}>{iv.round}</span>
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {formatTime(iv.time)} {iv.company && <span>&middot; {iv.company}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {profile && (
                      <button
                        onClick={() => setViewingProfile(profile)}
                        className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-primary transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="View profile"
                        title="View profile details"
                      >
                        <UserCircle size={16} />
                      </button>
                    )}
                    {iv.meetingLink && (
                      <a
                        href={iv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Join
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <Calendar
            interviews={interviews}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-ink">
            {isToday(selectedDate) ? "Today's Schedule" : formatDate(selectedDateStr)}
            <span className="text-sm font-normal text-ink-muted ml-2">
              ({selectedInterviews.length} interview{selectedInterviews.length !== 1 ? 's' : ''})
            </span>
          </h2>

          {selectedInterviews.length === 0 ? (
            <div className="card text-center py-10">
              <CalendarDays className="w-10 h-10 text-ink-light mx-auto mb-3" />
              <p className="text-ink-muted text-sm">No interviews scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-0">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="flex gap-4">
                  <div className="w-20 shrink-0 pt-3 text-right">
                    <span className="text-xs font-semibold text-ink-muted">{slot.label}</span>
                  </div>
                  <div className="flex-1 border-l-2 border-border pl-4 pb-4 relative">
                    <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-primary" />
                    <div className="space-y-3 pt-1">
                      {slot.interviews.map((iv) => (
                        <InterviewCard
                          key={iv.id}
                          interview={iv}
                          profiles={profiles}
                          users={users}
                          profileName={getProfileName(iv.profileId)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewingProfile && (
        <ProfileQuickModal
          profile={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  );
}
