import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { ListOrdered, Plus, Trash2 } from 'lucide-react';

export default function ManageRoundsPage() {
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { api.getRounds().then(setRounds); }, [refreshKey]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const exists = rounds.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error('A round with this name already exists.');
      return;
    }
    await api.createRound(trimmed);
    setNewName('');
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (id) => {
    await api.deleteRound(id);
    setDeleteConfirm(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Rounds</h1>
          <p className="text-ink-muted mt-0.5">Interview round types for scheduling</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Round
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="round-name" className="label">Round Name</label>
              <input
                id="round-name"
                type="text"
                className="input"
                placeholder="e.g. Screening, L1, L2, HR, Technical"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary">Add</button>
            <button type="button" onClick={() => { setShowForm(false); setNewName(''); }} className="btn-secondary">Cancel</button>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 font-medium text-ink-muted">Round Name</th>
                <th className="text-right px-5 py-3 font-medium text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rounds.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-ink-muted">
                    <ListOrdered className="w-8 h-8 mx-auto mb-2 text-ink-light" />
                    No rounds added yet
                  </td>
                </tr>
              ) : (
                rounds.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-medium text-ink">{r.name}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteConfirm(r.id)}
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

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Round">
        <p className="text-sm text-ink-muted mb-4">
          Are you sure you want to delete this round? The record will be archived. Existing interviews using it will not be affected.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
