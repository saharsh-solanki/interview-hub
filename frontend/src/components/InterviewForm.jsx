import { useState, useEffect, useMemo } from "react";
import * as api from "../services/api";

const STATUSES = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];

export default function InterviewForm({
  onSubmit,
  initialData,
  defaultValues,
  profiles: profilesProp,
  users: usersProp,
  onCancel,
  submitLabel,
}) {
  const profiles = profilesProp || [];
  const users = usersProp || [];
  const [companies, setCompanies] = useState([]);
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    api.getCompanies().then(setCompanies).catch(() => {});
    api.getRounds().then(setRounds).catch(() => {});
  }, []);

  const interviewers = useMemo(
    () => users.filter((u) => u.role === "interviewer"),
    [users]
  );
  const isEditing = Boolean(initialData);
  const source = initialData || defaultValues;

  const [form, setForm] = useState({
    profileId: source?.profileId || "",
    assignedTo: source?.assignedTo || "",
    round: source?.round || "",
    date: source?.date || "",
    time: source?.time || "",
    meetingLink: source?.meetingLink || "",
    jdLink: source?.jdLink || "",
    resumeLink: source?.resumeLink || "",
    company: source?.company || "",
    status: source?.status || "Scheduled",
    description: source?.description || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.profileId) errs.profileId = "Profile is required";
    if (!form.assignedTo) errs.assignedTo = "Interviewer is required";
    if (!form.round) errs.round = "Round is required";
    if (!form.date) errs.date = "Date is required";
    if (!form.time) errs.time = "Time is required";
    if (!form.company) errs.company = "Company is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    if (!isEditing) {
      setForm({
        profileId: "",
        assignedTo: "",
        round: "",
        date: "",
        time: "",
        meetingLink: "",
        jdLink: "",
        resumeLink: "",
        company: "",
        status: "Scheduled",
        description: "",
      });
    }
  };

  const fieldClass = (field) =>
    `input ${errors[field] ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="profileId" className="label">Profile *</label>
          <select
            id="profileId"
            value={form.profileId}
            onChange={handleChange("profileId")}
            className={fieldClass("profileId")}
          >
            <option value="">Select profile...</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.profileId && <p className="text-xs text-danger mt-1">{errors.profileId}</p>}
        </div>

        <div>
          <label htmlFor="assignedTo" className="label">Assigned To *</label>
          <select
            id="assignedTo"
            value={form.assignedTo}
            onChange={handleChange("assignedTo")}
            className={fieldClass("assignedTo")}
          >
            <option value="">Select interviewer...</option>
            {interviewers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {errors.assignedTo && <p className="text-xs text-danger mt-1">{errors.assignedTo}</p>}
        </div>

        <div>
          <label htmlFor="company" className="label">Company (Applied At) *</label>
          <select
            id="company"
            value={form.company}
            onChange={handleChange("company")}
            className={fieldClass("company")}
          >
            <option value="">Select company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {errors.company && <p className="text-xs text-danger mt-1">{errors.company}</p>}
        </div>

        <div>
          <label htmlFor="round" className="label">Round *</label>
          <select
            id="round"
            value={form.round}
            onChange={handleChange("round")}
            className={fieldClass("round")}
          >
            <option value="">Select round...</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
          {errors.round && <p className="text-xs text-danger mt-1">{errors.round}</p>}
        </div>

        <div>
          <label htmlFor="date" className="label">Date *</label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={handleChange("date")}
            className={fieldClass("date")}
          />
          {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="time" className="label">Time *</label>
          <input
            id="time"
            type="time"
            value={form.time}
            onChange={handleChange("time")}
            className={fieldClass("time")}
          />
          {errors.time && <p className="text-xs text-danger mt-1">{errors.time}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="meetingLink" className="label">Meeting Link</label>
        <input
          id="meetingLink"
          type="url"
          value={form.meetingLink}
          onChange={handleChange("meetingLink")}
          className="input"
          placeholder="https://teams.microsoft.com/..."
        />
      </div>

      <div>
        <label htmlFor="jdLink" className="label">JD Link</label>
        <input
          id="jdLink"
          type="url"
          value={form.jdLink}
          onChange={handleChange("jdLink")}
          className="input"
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="resumeLink" className="label">Resume Link</label>
        <input
          id="resumeLink"
          type="url"
          value={form.resumeLink}
          onChange={handleChange("resumeLink")}
          className="input"
          placeholder="https://drive.google.com/..."
        />
      </div>

      {isEditing && (
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={handleChange("status")}
            className="input"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={handleChange("description")}
          className="input min-h-[80px] resize-y"
          placeholder="Employment history, relevant experience, key projects, technologies worked on..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary">
          {submitLabel || (isEditing ? "Update Interview" : "Schedule Interview")}
        </button>
      </div>
    </form>
  );
}
