import { useState, useEffect } from "react";
import {
  ExternalLink,
  FileText,
  FileCheck,
  Download,
  Pencil,
  Clock,
  User,
  Building2,
  Briefcase,
  UserCircle,
  X,
  MessageSquare,
  Send,
  History,
  HelpCircle,
  MessageCircle,
  StickyNote,
  ChevronDown,
  ChevronUp,
  CopyPlus,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";
import { getRoundColor, getStatusColor, formatTime, formatDateTime } from "../utils/helpers";
import * as api from "../services/api";

function ProfileAuditTrailInline({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const history = profile.editHistory || [];

  if (!profile.createdAt && history.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-ink-light hover:text-ink-muted transition-colors cursor-pointer w-full"
      >
        <History size={12} />
        Audit Trail ({history.length} edit{history.length !== 1 ? "s" : ""})
        {expanded ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {profile.createdAt && (
            <div className="text-xs text-ink-light">
              Created {profile.createdBy ? `by ${profile.createdBy}` : ""} on{" "}
              {new Date(profile.createdAt).toLocaleString()}
            </div>
          )}
          {history.map((entry, i) => (
            <div key={i} className="text-xs text-ink-light">
              Edited by <span className="font-medium text-ink-muted">{entry.editedBy}</span> on{" "}
              {new Date(entry.editedAt).toLocaleString()}
              {entry.changes && <span className="text-ink-muted"> — changed: {entry.changes}</span>}
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-xs text-ink-light">No edits recorded</div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileModal({ profile, onClose }) {
  if (!profile) return null;

  const fields = [
    { label: "Full Name", value: profile.name },
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Father's Name", value: profile.fatherName },
    { label: "Mother's Name", value: profile.motherName },
    { label: "Date of Birth", value: profile.dob },
    { label: "Education", value: profile.education },
    { label: "Passout Year", value: profile.passoutYear },
    { label: "Experience", value: profile.experience },
    { label: "Skills", value: profile.skills },
    { label: "Aadhaar", value: profile.aadhaar },
    { label: "PAN", value: profile.pan },
    { label: "Current Company", value: profile.currentCompany },
    { label: "Designation", value: profile.designation },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-card flex items-center justify-between px-5 py-4 border-b border-border z-10">
          <div className="flex items-center gap-2">
            <UserCircle size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-ink">Profile Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-xs text-ink-muted mb-0.5">{f.label}</p>
                <p className="text-sm font-medium text-ink">{f.value || "—"}</p>
              </div>
            ))}
          </div>
          {profile.resumeLink && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-ink-muted mb-1.5">Resume</p>
              <a
                href={profile.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-1.5 px-3 inline-flex"
              >
                <FileCheck size={14} />
                View Resume
              </a>
            </div>
          )}
          <ProfileAuditTrailInline profile={profile} />
        </div>
      </div>
    </div>
  );
}

const NOTE_TYPES = [
  { value: "question", label: "Question", icon: HelpCircle, color: "border-l-primary text-primary" },
  { value: "answer", label: "Answer", icon: MessageCircle, color: "border-l-accent text-accent" },
  { value: "note", label: "Note", icon: StickyNote, color: "border-l-warning text-warning" },
];

function NotesThread({ interview, currentUserName, onNoteAdded }) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");

  const notes = interview.notes || [];

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await api.addInterviewNote(interview.id, {
      text: noteText.trim(),
      type: noteType,
    });
    setNoteText("");
    onNoteAdded?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors cursor-pointer w-full"
      >
        <MessageSquare size={14} />
        Notes ({notes.length})
        {expanded ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {notes.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notes.map((note) => {
                const typeInfo = NOTE_TYPES.find((t) => t.value === note.type) || NOTE_TYPES[2];
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={note.id}
                    className={`border-l-2 ${typeInfo.color.split(" ")[0]} bg-surface-muted/50 rounded-r-lg px-3 py-2`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={12} className={typeInfo.color.split(" ")[1]} />
                      <span className="text-xs font-medium text-ink">{note.author}</span>
                      <span className="text-xs text-ink-light">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-ink whitespace-pre-wrap">{note.text}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="input py-1.5 text-xs w-28 shrink-0"
            >
              {NOTE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a question, answer, or note..."
              className="input text-sm min-h-[36px] resize-none flex-1"
              rows={1}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="btn-primary py-1.5 px-3 text-xs shrink-0 disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditTrail({ interview }) {
  const [expanded, setExpanded] = useState(false);
  const history = interview.editHistory || [];

  if (!interview.createdAt && history.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-ink-light hover:text-ink-muted transition-colors cursor-pointer w-full"
      >
        <History size={12} />
        Audit Trail
        {expanded ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {interview.createdAt && (
            <div className="text-xs text-ink-light">
              Created {interview.createdBy ? `by ${interview.createdBy}` : ""} on{" "}
              {new Date(interview.createdAt).toLocaleString()}
            </div>
          )}
          {history.map((entry, i) => (
            <div key={i} className="text-xs text-ink-light">
              Edited by {entry.editedBy} on {new Date(entry.editedAt).toLocaleString()}
              {entry.changes && <span className="text-ink-muted"> — changed: {entry.changes}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoundChain({ interview }) {
  const [chain, setChain] = useState([]);

  useEffect(() => {
    if (interview.previousRoundId || interview.nextRoundId) {
      api.getRoundChain(interview.id).then(setChain).catch(() => {});
    }
  }, [interview.id, interview.previousRoundId, interview.nextRoundId]);

  if (chain.length <= 1) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-1">
        <LinkIcon size={12} />
        <span className="font-medium">Round Chain</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {chain.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                step.id === interview.id
                  ? "bg-primary text-white"
                  : step.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {step.round}
            </span>
            {i < chain.length - 1 && (
              <ArrowRight size={12} className="text-ink-light" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InterviewCard({
  interview,
  profiles,
  users,
  profileName: profileNameProp,
  interviewerName: interviewerNameProp,
  onEdit,
  onNextRound,
  onNoteAdded,
  isAdmin,
  showActions,
  compact,
  currentUserName,
}) {
  const [showProfile, setShowProfile] = useState(false);

  const profile = profiles?.find((p) => p.id === interview.profileId) || null;
  const profileName = profileNameProp || profile?.name || "Unknown Profile";
  const interviewerName =
    interviewerNameProp ||
    users?.find((u) => u.id === interview.assignedTo)?.name ||
    "Unassigned";

  const canShowActions = isAdmin || showActions;

  if (compact) {
    return (
      <div className="card py-3 px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-ink truncate">
                {profileName}
              </span>
              <span className={`badge ${getRoundColor(interview.round)}`}>
                {interview.round}
              </span>
              <span className={`badge ${getStatusColor(interview.status)}`}>
                {interview.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
              {profile?.currentCompany && <span>{profile.currentCompany}</span>}
              <span>
                {interview.date} at {formatTime(interview.time)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {profile && (
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-primary transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="View profile details"
              >
                <UserCircle size={16} />
              </button>
            )}
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-1.5 px-3"
              >
                <ExternalLink size={14} />
                Join
              </a>
            )}
          </div>
        </div>
        {showProfile && (
          <ProfileModal
            profile={profile}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="card hover:border-primary/30 transition-colors duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-ink truncate">
              {profileName}
            </h3>
            <span className={`badge ${getRoundColor(interview.round)}`}>
              {interview.round}
            </span>
            <span className={`badge ${getStatusColor(interview.status)}`}>
              {interview.status}
            </span>
          </div>

          <div className="space-y-1.5 mt-3">
            {profile?.currentCompany && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Building2 size={14} className="shrink-0" />
                <span className="truncate">Current Company: {profile.currentCompany}</span>
              </div>
            )}
            {interview.company && (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Briefcase size={14} className="shrink-0" />
                <span className="truncate">Applied At: {interview.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Clock size={14} className="shrink-0" />
              <span>
                {interview.date} at {formatTime(interview.time)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <User size={14} className="shrink-0" />
              <span className="truncate">Interviewer: {interviewerName}</span>
            </div>
          </div>

          {interview.description && (
            <p className="mt-2 text-sm text-ink-muted line-clamp-2">
              {interview.description}
            </p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          {profile && (
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-primary transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="View profile details"
              title="View profile"
            >
              <UserCircle size={16} />
            </button>
          )}
          {canShowActions && onEdit && (
            <button
              onClick={() => onEdit?.(interview)}
              className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-primary transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Edit interview"
            >
              <Pencil size={16} />
            </button>
          )}
          {onNextRound && !interview.nextRoundId && (
            <button
              onClick={() => onNextRound(interview)}
              className="p-2 rounded-lg text-ink-muted hover:bg-surface-muted hover:text-accent transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Create next round"
              title="Create next round"
            >
              <CopyPlus size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border flex-wrap">
        {interview.meetingLink && (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-1.5 px-3"
          >
            <ExternalLink size={14} />
            Join Meeting
          </a>
        )}
        {interview.jdLink && (
          <a
            href={interview.jdLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <FileText size={14} />
            View JD
          </a>
        )}
        {interview.resumeLink && (
          <>
            <a
              href={interview.resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <FileCheck size={14} />
              View Resume
            </a>
            <a
              href={interview.resumeLink}
              download
              className="btn-ghost text-xs py-1.5 px-3"
            >
              <Download size={14} />
              Download
            </a>
          </>
        )}
      </div>

      <NotesThread
        interview={interview}
        currentUserName={currentUserName}
        onNoteAdded={onNoteAdded}
      />

      <AuditTrail interview={interview} />

      <RoundChain interview={interview} />

      {showProfile && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
