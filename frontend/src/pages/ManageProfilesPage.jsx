import { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import { downloadCSV, downloadExcel } from '../utils/export';
import Modal from '../components/Modal';
import { Plus, Search, Pencil, Trash2, Eye, UserCircle, Download, FileSpreadsheet, ExternalLink, History, ChevronDown, ChevronUp } from 'lucide-react';

const emptyProfile = {
  name: '', email: '', phone: '', fatherName: '', motherName: '',
  dob: '', education: '', passoutYear: '', experience: '',
  skills: '', aadhaar: '', pan: '', currentCompany: '', designation: '',
  resumeLink: '',
};

function profilesToRows(profiles) {
  return profiles.map((p) => ({
    "Name": p.name || "",
    "Email": p.email || "",
    "Phone": p.phone || "",
    "Father's Name": p.fatherName || "",
    "Mother's Name": p.motherName || "",
    "Date of Birth": p.dob || "",
    "Education": p.education || "",
    "Passout Year": p.passoutYear || "",
    "Experience": p.experience || "",
    "Skills": p.skills || "",
    "Aadhaar": p.aadhaar || "",
    "PAN": p.pan || "",
    "Current Company": p.currentCompany || "",
    "Designation": p.designation || "",
    "Resume Link": p.resumeLink || "",
  }));
}

function ProfileAuditTrail({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const history = profile.editHistory || [];

  if (!profile.createdAt && history.length === 0) return null;

  return (
    <div className="pt-3 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-ink-light hover:text-ink-muted transition-colors cursor-pointer w-full"
      >
        <History className="w-3 h-3" />
        Audit Trail ({history.length} edit{history.length !== 1 ? 's' : ''})
        {expanded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          {profile.createdAt && (
            <div className="text-xs text-ink-light">
              Created {profile.createdBy ? `by ${profile.createdBy}` : ''} on{' '}
              {new Date(profile.createdAt).toLocaleString()}
            </div>
          )}
          {history.map((entry, i) => (
            <div key={i} className="text-xs text-ink-light">
              Edited by <span className="font-medium text-ink-muted">{entry.editedBy}</span> on{' '}
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

export default function ManageProfilesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { api.getProfiles().then(setProfiles); }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const openAdd = () => {
    setEditingProfile(null);
    setForm(emptyProfile);
    setModalOpen(true);
  };

  const openEdit = (profile) => {
    setEditingProfile(profile);
    setForm({ ...emptyProfile, ...profile });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingProfile) {
      await api.updateProfile(editingProfile.id, form);
    } else {
      await api.createProfile(form);
    }
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (id) => {
    await api.deleteProfile(id);
    setDeleteConfirm(null);
    setRefreshKey((k) => k + 1);
  };

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleExportCSV = () => {
    const rows = profilesToRows(profiles);
    downloadCSV(rows, "profiles.csv");
  };

  const handleExportExcel = () => {
    const rows = profilesToRows(profiles);
    downloadExcel(rows, "profiles.xls");
  };

  const formFields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'fatherName', label: "Father's Name" },
    { key: 'motherName', label: "Mother's Name" },
    { key: 'dob', label: 'Date of Birth', type: 'date' },
    { key: 'education', label: 'Education' },
    { key: 'passoutYear', label: 'Passout Year' },
    { key: 'experience', label: 'Experience (years)' },
    { key: 'skills', label: 'Skills' },
    { key: 'aadhaar', label: 'Aadhaar Number' },
    { key: 'pan', label: 'PAN Number' },
    { key: 'currentCompany', label: 'Current Company' },
    { key: 'designation', label: 'Designation' },
    { key: 'resumeLink', label: 'Resume Link (URL)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Profiles</h1>
          <p className="text-ink-muted mt-0.5">Candidate profiles for interviews</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-xs">
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button onClick={handleExportExcel} className="btn-secondary text-xs">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Profile
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search profiles by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 font-medium text-ink-muted">Name</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted hidden lg:table-cell">Education</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted hidden lg:table-cell">Passout Year</th>
                <th className="text-left px-5 py-3 font-medium text-ink-muted hidden lg:table-cell">Experience</th>
                <th className="text-right px-5 py-3 font-medium text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-ink-muted">
                    <UserCircle className="w-8 h-8 mx-auto mb-2 text-ink-light" />
                    No profiles found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-muted/50 transition-colors duration-150">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setViewModal(p)}
                        className="font-medium text-primary hover:underline cursor-pointer text-left"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted hidden md:table-cell">{p.email || '—'}</td>
                    <td className="px-5 py-3.5 text-ink-muted hidden md:table-cell">{p.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-ink-muted hidden lg:table-cell">{p.education || '—'}</td>
                    <td className="px-5 py-3.5 text-ink-muted hidden lg:table-cell">{p.passoutYear || '—'}</td>
                    <td className="px-5 py-3.5 text-ink-muted hidden lg:table-cell">{p.experience ? `${p.experience} yrs` : '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewModal(p)} className="btn-ghost p-2" aria-label="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(p)} className="btn-ghost p-2" aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="btn-ghost p-2 text-danger hover:bg-danger-light" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProfile ? 'Edit Profile' : 'Add Profile'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="label">{f.label}</label>
                <input
                  id={f.key}
                  type={f.type || 'text'}
                  className="input"
                  value={form[f.key] || ''}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  required={f.required}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingProfile ? 'Update' : 'Add'} Profile</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Profile Details" size="lg">
        {viewModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {formFields.filter((f) => f.key !== 'resumeLink').map((f) => (
                <div key={f.key}>
                  <p className="text-ink-muted text-xs mb-0.5">{f.label}</p>
                  <p className="text-ink font-medium">{viewModal[f.key] || '—'}</p>
                </div>
              ))}
            </div>
            {viewModal.resumeLink && (
              <div className="pt-3 border-t border-border">
                <p className="text-ink-muted text-xs mb-2">Resume</p>
                <div className="flex items-center gap-3">
                  <a
                    href={viewModal.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Resume
                  </a>
                  <a
                    href={viewModal.resumeLink}
                    download
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            )}
            <ProfileAuditTrail profile={viewModal} />
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Profile">
        <p className="text-sm text-ink-muted mb-4">Are you sure you want to delete this profile? The record will be archived and can be restored later.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
