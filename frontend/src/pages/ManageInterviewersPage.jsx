import { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { Plus, Trash2, UserCheck, CalendarDays } from 'lucide-react';

export default function ManageInterviewersPage() {
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '' });

  useEffect(() => {
    api.getUsers().then(setAllUsers);
    api.getInterviews().then(setInterviews);
  }, [refreshKey]);

  const users = useMemo(
    () => allUsers.filter((u) => u.role === 'interviewer'),
    [allUsers]
  );

  const interviewCounts = useMemo(() => {
    const counts = {};
    interviews.forEach((iv) => {
      counts[iv.assignedTo] = (counts[iv.assignedTo] || 0) + 1;
    });
    return counts;
  }, [interviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    try {
      await api.createUser({
        name,
        password: `${name}@123`,
        role: 'interviewer',
      });
      setModalOpen(false);
      setForm({ name: '' });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    await api.deleteUser(id);
    setDeleteConfirm(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Interviewers</h1>
          <p className="text-ink-muted mt-0.5">People who take interviews</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Interviewer
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 font-medium text-ink-muted">Name</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted">Role</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted">Interviews</th>
                <th className="text-right px-5 py-3 font-medium text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-ink-muted">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-ink-light" />
                    No interviewers added yet
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-medium text-ink">{u.name}</td>
                    <td className="px-5 py-3.5 text-ink-muted text-xs">{u.role}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-ink-muted">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {interviewCounts[u.id] || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteConfirm(u.id)}
                        className="btn-ghost p-2 text-danger hover:bg-danger-light"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Interviewer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="interviewer-name" className="label">Name</label>
            <input
              id="interviewer-name"
              type="text"
              className="input"
              placeholder="e.g. Saharsh"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <p className="text-xs text-ink-muted">
            Password will be auto-set to <span className="font-mono">{form.name.trim() || 'Name'}@123</span>
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Interviewer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Interviewer">
        <p className="text-sm text-ink-muted mb-4">
          Are you sure you want to delete this interviewer? The record will be archived. Their scheduled interviews will not be affected.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
