import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import { interviewsToRows, downloadCSV, downloadExcel } from '../utils/export';
import { format, isToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import InterviewCard from '../components/InterviewCard';
import { CalendarDays, Filter, X, Search, Download, FileSpreadsheet } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

function buildTimeSlots(interviews) {
  if (interviews.length === 0) return [];
  const slots = {};
  interviews.forEach((iv) => {
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
}

export default function AllSchedulesPage() {
  const { isStaff } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [nameSearch, setNameSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filters, setFilters] = useState({
    interviewerId: '',
    profileId: '',
    round: '',
    status: '',
  });

  const [interviews, setInterviews] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    api.getInterviews().then(setInterviews);
    api.getProfiles().then(setProfiles);
    api.getUsers().then(setAllUsers);
    api.getRounds().then(setRounds);
  }, [refreshKey]);

  const interviewers = useMemo(() => allUsers.filter((u) => u.role === 'interviewer'), [allUsers]);

  const hasActiveFilter = Object.values(filters).some(Boolean) || nameSearch.trim() || dateFrom || dateTo;
  const hasDateRange = dateFrom && dateTo;

  const filteredInterviews = useMemo(() => {
    return interviews.filter((iv) => {
      if (filters.interviewerId && iv.assignedTo !== filters.interviewerId) return false;
      if (filters.profileId && iv.profileId !== filters.profileId) return false;
      if (filters.round && iv.round !== filters.round) return false;
      if (filters.status && iv.status !== filters.status) return false;

      if (nameSearch.trim()) {
        const q = nameSearch.toLowerCase();
        const profile = profiles.find((p) => p.id === iv.profileId);
        const interviewer = allUsers.find((u) => u.id === iv.assignedTo);
        const profileMatch = profile?.name?.toLowerCase().includes(q);
        const interviewerMatch = interviewer?.name?.toLowerCase().includes(q);
        if (!profileMatch && !interviewerMatch) return false;
      }

      if (dateFrom && iv.date < dateFrom) return false;
      if (dateTo && iv.date > dateTo) return false;

      return true;
    });
  }, [interviews, filters, nameSearch, dateFrom, dateTo, profiles, allUsers]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const selectedInterviews = useMemo(
    () => filteredInterviews
      .filter((iv) => iv.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [filteredInterviews, selectedDateStr]
  );

  const dateGroupedInterviews = useMemo(() => {
    if (!hasDateRange) return [];
    const grouped = {};
    filteredInterviews
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .forEach((iv) => {
        if (!grouped[iv.date]) grouped[iv.date] = [];
        grouped[iv.date].push(iv);
      });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, ivs]) => ({ date, interviews: ivs, timeSlots: buildTimeSlots(ivs) }));
  }, [filteredInterviews, hasDateRange]);

  const timeSlots = useMemo(() => buildTimeSlots(selectedInterviews), [selectedInterviews]);

  const clearFilters = () => {
    setFilters({ interviewerId: '', profileId: '', round: '', status: '' });
    setNameSearch('');
    setDateFrom('');
    setDateTo('');
  };

  const handleDownloadCSV = () => {
    const rows = interviewsToRows(filteredInterviews, profiles, allUsers);
    downloadCSV(rows, 'interviews.csv');
  };

  const handleDownloadExcel = () => {
    const rows = interviewsToRows(filteredInterviews, profiles, allUsers);
    downloadExcel(rows, 'interviews.xlsx');
  };

  const handleNextRound = (interview) => {
    navigate('/admin/schedule', { state: { nextRoundFrom: interview } });
  };

  const renderTimeline = (slots) => (
    <div className="space-y-0">
      {slots.map((slot) => (
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
                  users={allUsers}
                  onNextRound={isStaff ? handleNextRound : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">All Schedules</h1>
          <p className="text-ink-muted mt-0.5">View and filter all interviews</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="btn-secondary text-xs"
            disabled={filteredInterviews.length === 0}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleDownloadExcel}
            className="btn-secondary text-xs"
            disabled={filteredInterviews.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-ink-muted" />
          <span className="text-sm font-medium text-ink">Filters</span>
          {hasActiveFilter && (
            <button onClick={clearFilters} className="btn-ghost text-xs py-1 px-2 ml-auto">
              <X className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by profile or interviewer name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SearchableSelect
              options={interviewers
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((u) => ({ value: u.id, label: u.name }))}
              value={filters.interviewerId}
              onChange={(val) => setFilters((f) => ({ ...f, interviewerId: val }))}
              placeholder="All Interviewers"
              allLabel="All Interviewers"
            />

            <SearchableSelect
              options={profiles
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => ({ value: p.id, label: p.name }))}
              value={filters.profileId}
              onChange={(val) => setFilters((f) => ({ ...f, profileId: val }))}
              placeholder="All Profiles"
              allLabel="All Profiles"
            />

            <select
              className="input"
              value={filters.round}
              onChange={(e) => setFilters((f) => ({ ...f, round: e.target.value }))}
            >
              <option value="">All Rounds</option>
              {rounds.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>

            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="dateFrom" className="text-xs font-medium text-ink-muted mb-1 block">From</label>
              <input
                id="dateFrom"
                type="date"
                className="input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="text-xs font-medium text-ink-muted mb-1 block">To</label>
              <input
                id="dateTo"
                type="date"
                className="input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <Calendar
            interviews={filteredInterviews}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <div className="mt-3 text-center text-xs text-ink-muted">
            {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} total
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          {hasDateRange ? (
            <>
              <h2 className="text-lg font-semibold text-ink">
                {formatDate(dateFrom)} &mdash; {formatDate(dateTo)}
                <span className="text-sm font-normal text-ink-muted ml-2">
                  ({filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''})
                </span>
              </h2>

              {dateGroupedInterviews.length === 0 ? (
                <div className="card text-center py-10">
                  <CalendarDays className="w-10 h-10 text-ink-light mx-auto mb-3" />
                  <p className="text-ink-muted text-sm">No interviews in this date range</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dateGroupedInterviews.map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-sm font-semibold text-ink bg-surface-muted px-3 py-1 rounded-lg">
                          {formatDate(group.date)}
                        </h3>
                        <span className="text-xs text-ink-muted">
                          {group.interviews.length} interview{group.interviews.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {renderTimeline(group.timeSlots)}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-ink">
                {isToday(selectedDate) ? "Today's Interviews" : formatDate(selectedDateStr)}
                <span className="text-sm font-normal text-ink-muted ml-2">
                  ({selectedInterviews.length} interview{selectedInterviews.length !== 1 ? 's' : ''})
                </span>
              </h2>

              {selectedInterviews.length === 0 ? (
                <div className="card text-center py-10">
                  <CalendarDays className="w-10 h-10 text-ink-light mx-auto mb-3" />
                  <p className="text-ink-muted text-sm">No interviews for this day</p>
                </div>
              ) : (
                renderTimeline(timeSlots)
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
