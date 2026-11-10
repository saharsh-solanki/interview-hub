import { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { Building2, Plus, Trash2, Search } from 'lucide-react';

export default function ManageCompaniesPage() {
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { api.getCompanies().then(setCompanies); }, [refreshKey]);

  const filtered = useMemo(() => {
    const list = [...companies].sort((a, b) => a.name.localeCompare(b.name));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const exists = companies.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error('A company with this name already exists.');
      return;
    }
    await api.createCompany(trimmed);
    setNewName('');
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (id) => {
    await api.deleteCompany(id);
    setDeleteConfirm(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Companies</h1>
          <p className="text-ink-muted mt-0.5">Companies available for interview scheduling</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="company-name" className="label">Company Name</label>
              <input
                id="company-name"
                type="text"
                className="input"
                placeholder="e.g. Google, TCS, Infosys"
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

      <div className="relative">
        <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 font-medium text-ink-muted">Company Name</th>
                <th className="text-right px-5 py-3 font-medium text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-ink-muted">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-ink-light" />
                    No companies found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-medium text-ink">{c.name}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteConfirm(c.id)}
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

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Company">
        <p className="text-sm text-ink-muted mb-4">
          Are you sure you want to delete this company? The record will be archived. Existing interviews referencing it will not be affected.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
