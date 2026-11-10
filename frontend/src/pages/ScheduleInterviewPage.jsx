import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { useAuth } from "../context/AuthContext";
import InterviewForm from "../components/InterviewForm";
import InterviewCard from "../components/InterviewCard";
import Modal from "../components/Modal";
import { CalendarPlus, CheckCircle2, CopyPlus } from "lucide-react";

export default function ScheduleInterviewPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [success, setSuccess] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [nextRoundModal, setNextRoundModal] = useState(null);

  const [interviews, setInterviews] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (location.state?.nextRoundFrom) {
      setNextRoundModal(location.state.nextRoundFrom);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    api.getInterviews().then(setInterviews);
    api.getProfiles().then(setProfiles);
    api.getUsers().then(setUsers);
  }, [refreshKey]);

  const recentInterviews = [...interviews]
    .sort((a, b) => {
      const da = `${a.date}T${a.time}`;
      const db = `${b.date}T${b.time}`;
      return db.localeCompare(da);
    })
    .slice(0, 10);

  const handleSchedule = async (data) => {
    await api.createInterview(data);
    setRefreshKey((k) => k + 1);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleNextRoundSubmit = async (data) => {
    await api.createInterview({
      ...data,
      previous_round_id: nextRoundModal.id,
    });
    setNextRoundModal(null);
    setRefreshKey((k) => k + 1);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleOpenNextRound = (interview) => {
    setNextRoundModal(interview);
  };

  const handleUpdate = async (data) => {
    if (editModal) {
      await api.updateInterview(editModal.id, data);
      setEditModal(null);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Schedule Interview</h1>
        <p className="text-ink-muted mt-0.5">
          Create and manage interview schedules
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success-light border border-success/20 px-4 py-3 text-sm text-accent-dark">
          <CheckCircle2 className="w-4 h-4" />
          Interview scheduled successfully
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-primary" />
            New Interview
          </h2>
          <InterviewForm
            onSubmit={handleSchedule}
            profiles={profiles}
            users={users}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink mb-4">
            Recently Scheduled
          </h2>
          {recentInterviews.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-ink-muted text-sm">
                No interviews scheduled yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInterviews.map((iv) => (
                <InterviewCard
                  key={iv.id}
                  interview={iv}
                  profiles={profiles}
                  users={users}
                  onEdit={() => setEditModal(iv)}
                  onNextRound={handleOpenNextRound}
                  onNoteAdded={() => setRefreshKey((k) => k + 1)}
                  currentUserName={user?.name}
                  showActions
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Interview"
      >
        {editModal && (
          <InterviewForm
            initialData={editModal}
            onSubmit={handleUpdate}
            onCancel={() => setEditModal(null)}
            profiles={profiles}
            users={users}
            submitLabel="Update Interview"
          />
        )}
      </Modal>

      <Modal
        isOpen={!!nextRoundModal}
        onClose={() => setNextRoundModal(null)}
        title="Create Next Round"
        size="lg"
      >
        {nextRoundModal && (
          <>
            <div className="flex items-center gap-2 mb-4 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 text-sm text-accent">
              <CopyPlus className="w-4 h-4 shrink-0" />
              <span>
                Creating next round for{" "}
                <strong>
                  {profiles.find((p) => p.id === nextRoundModal.profileId)?.name ||
                   profiles.find((p) => p.id === nextRoundModal.profile_id)?.name}
                </strong>
                {nextRoundModal.company && (
                  <> at <strong>{nextRoundModal.company}</strong></>
                )}
                {" "}&middot; Previous: {nextRoundModal.round}
              </span>
            </div>
            <InterviewForm
              defaultValues={{
                profileId: nextRoundModal.profileId || nextRoundModal.profile_id,
                assignedTo: nextRoundModal.assignedTo || nextRoundModal.assigned_to,
                company: nextRoundModal.company,
                jdLink: nextRoundModal.jdLink || nextRoundModal.jd_link || "",
                resumeLink: nextRoundModal.resumeLink || nextRoundModal.resume_link || "",
                description: nextRoundModal.description || "",
              }}
              onSubmit={handleNextRoundSubmit}
              onCancel={() => setNextRoundModal(null)}
              profiles={profiles}
              users={users}
              submitLabel="Schedule Next Round"
            />
          </>
        )}
      </Modal>
    </div>
  );
}
