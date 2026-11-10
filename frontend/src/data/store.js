const STORAGE_KEY = "interview_hub";

const DEFAULT_DATA = {
  users: [
    { id: "admin", name: "Admin", password: "admin@123", role: "admin" },
    { id: "saharsh", name: "Saharsh", password: "saharsh@123", role: "interviewer" },
    { id: "bhupen", name: "Bhupen", password: "bhupen@123", role: "interviewer" },
  ],
  profiles: [
    {
      id: "p1",
      name: "Bhupen Patel",
      email: "bhupen@example.com",
      phone: "9876543210",
      fatherName: "Rajesh Patel",
      motherName: "Meena Patel",
      dob: "1995-06-15",
      education: "B.Tech Computer Science",
      passoutYear: "2017",
      experience: "5 years",
      skills: "React, Node.js, Python",
      aadhaar: "XXXX-XXXX-1234",
      pan: "ABCDE1234F",
      currentCompany: "TechCorp",
      designation: "Senior Developer",
      resumeLink: "",
    },
    {
      id: "p2",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "9876543211",
      fatherName: "Vijay Sharma",
      motherName: "Sunita Sharma",
      dob: "1996-03-22",
      education: "MCA",
      passoutYear: "2019",
      experience: "3 years",
      skills: "Java, Spring Boot, AWS",
      aadhaar: "XXXX-XXXX-5678",
      pan: "FGHIJ5678K",
      currentCompany: "InfoSys",
      designation: "Software Engineer",
      resumeLink: "",
    },
  ],
  companies: [
    { id: "c1", name: "Google" },
    { id: "c2", name: "TCS" },
    { id: "c3", name: "Infosys" },
    { id: "c4", name: "Microsoft" },
  ],
  rounds: [
    { id: "r1", name: "Screening" },
    { id: "r2", name: "L1" },
    { id: "r3", name: "L2" },
    { id: "r4", name: "HR" },
    { id: "r5", name: "Technical" },
    { id: "r6", name: "Managerial" },
  ],
  interviews: [],
  interviewQuestions: [],
};

export function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function initStore() {
  const existing = getStore();
  if (!existing) {
    setStore(DEFAULT_DATA);
    return;
  }
  let changed = false;
  if (!existing.companies) {
    existing.companies = DEFAULT_DATA.companies;
    changed = true;
  }
  if (!existing.rounds) {
    existing.rounds = DEFAULT_DATA.rounds;
    changed = true;
  }
  if (changed) setStore(existing);
}

// --- Users ---

export function getUsers() {
  return getStore().users;
}

export function addUser(user) {
  const store = getStore();
  store.users.push({ ...user, id: crypto.randomUUID() });
  setStore(store);
  return store.users;
}

export function deleteUser(id) {
  const store = getStore();
  store.users = store.users.filter((u) => u.id !== id);
  setStore(store);
}

// --- Profiles ---

export function getProfiles() {
  return getStore().profiles;
}

export function addProfile(profile) {
  const store = getStore();
  const newProfile = { ...profile, id: crypto.randomUUID() };
  store.profiles.push(newProfile);
  setStore(store);
  return newProfile;
}

export function updateProfile(id, data) {
  const store = getStore();
  const idx = store.profiles.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.profiles[idx] = { ...store.profiles[idx], ...data };
    setStore(store);
  }
  return store.profiles[idx];
}

export function deleteProfile(id) {
  const store = getStore();
  store.profiles = store.profiles.filter((p) => p.id !== id);
  setStore(store);
}

// --- Companies ---

export function getCompanies() {
  return getStore().companies || [];
}

export function addCompany(name) {
  const store = getStore();
  if (!store.companies) store.companies = [];
  const newCompany = { id: crypto.randomUUID(), name };
  store.companies.push(newCompany);
  setStore(store);
  return newCompany;
}

export function deleteCompany(id) {
  const store = getStore();
  store.companies = (store.companies || []).filter((c) => c.id !== id);
  setStore(store);
}

// --- Rounds ---

export function getRounds() {
  return getStore().rounds || [];
}

export function addRound(name) {
  const store = getStore();
  if (!store.rounds) store.rounds = [];
  const newRound = { id: crypto.randomUUID(), name };
  store.rounds.push(newRound);
  setStore(store);
  return newRound;
}

export function deleteRound(id) {
  const store = getStore();
  store.rounds = (store.rounds || []).filter((r) => r.id !== id);
  setStore(store);
}

// --- Interviews ---

export function getInterviews() {
  return getStore().interviews;
}

export function addInterview(interview) {
  const store = getStore();
  const newInterview = {
    ...interview,
    id: crypto.randomUUID(),
    status: interview.status || "Scheduled",
    createdAt: new Date().toISOString(),
    editHistory: [],
    notes: [],
  };
  store.interviews.push(newInterview);

  if (newInterview.previousRoundId) {
    const prevIdx = store.interviews.findIndex(
      (i) => i.id === newInterview.previousRoundId
    );
    if (prevIdx !== -1) {
      store.interviews[prevIdx].nextRoundId = newInterview.id;
    }
  }

  setStore(store);
  return newInterview;
}

export function updateInterview(id, data) {
  const store = getStore();
  const idx = store.interviews.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  const current = store.interviews[idx];

  const editedBy = data._editedBy || "unknown";
  const updateData = { ...data };
  delete updateData._editedBy;

  const changedFields = Object.keys(updateData).filter(
    (key) => key !== "editHistory" && key !== "notes" && updateData[key] !== current[key]
  );

  if (!current.editHistory) current.editHistory = [];
  if (changedFields.length > 0) {
    current.editHistory.push({
      editedBy,
      editedAt: new Date().toISOString(),
      changes: changedFields.join(", "),
    });
  }

  store.interviews[idx] = { ...current, ...updateData };
  setStore(store);
  return store.interviews[idx];
}

export function getInterviewsByInterviewer(interviewerId) {
  return getStore().interviews.filter((i) => i.assignedTo === interviewerId);
}

export function getRoundChain(interviewId) {
  const interviews = getStore().interviews;
  const chain = [];
  let current = interviews.find((i) => i.id === interviewId);
  if (!current) return chain;

  while (current?.previousRoundId) {
    current = interviews.find((i) => i.id === current.previousRoundId);
  }

  while (current) {
    chain.push({ id: current.id, round: current.round, date: current.date, status: current.status });
    current = current.nextRoundId
      ? interviews.find((i) => i.id === current.nextRoundId)
      : null;
  }
  return chain;
}

// --- Interview Notes ---

export function addInterviewNote(interviewId, note) {
  const store = getStore();
  const idx = store.interviews.findIndex((i) => i.id === interviewId);
  if (idx === -1) return null;

  if (!store.interviews[idx].notes) store.interviews[idx].notes = [];

  const newNote = {
    id: crypto.randomUUID(),
    text: note.text,
    author: note.author,
    type: note.type || "note",
    createdAt: new Date().toISOString(),
  };
  store.interviews[idx].notes.push(newNote);
  setStore(store);
  return newNote;
}

export function getInterviewNotes(interviewId) {
  const store = getStore();
  const interview = store.interviews.find((i) => i.id === interviewId);
  return interview?.notes || [];
}

// --- Interview Questions ---

export function getInterviewQuestions() {
  return getStore().interviewQuestions;
}

export function addInterviewQuestion(q) {
  const store = getStore();
  store.interviewQuestions.push({ ...q, id: crypto.randomUUID() });
  setStore(store);
  return store.interviewQuestions;
}

export function deleteInterviewQuestion(id) {
  const store = getStore();
  store.interviewQuestions = store.interviewQuestions.filter((q) => q.id !== id);
  setStore(store);
}
