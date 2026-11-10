import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as api from '../services/api';
import { useToast } from '../context/ToastContext';
import { HelpCircle, Plus, Trash2, ChevronDown, ChevronUp, Search, Mic, MicOff } from 'lucide-react';

const CATEGORIES = ['Technical', 'HR', 'Behavioral', 'Coding'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const difficultyColor = {
  Easy: 'bg-success-light text-accent-dark',
  Medium: 'bg-warning-light text-yellow-800',
  Hard: 'bg-danger-light text-danger',
};

const categoryColor = {
  Technical: 'bg-primary/10 text-primary',
  HR: 'bg-accent/10 text-accent',
  Behavioral: 'bg-warning/10 text-yellow-800',
  Coding: 'bg-purple-100 text-purple-700',
};

function useSpeechToText(onResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const supported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) onResult(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }, [supported, onResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, toggle, supported };
}

function truncate(text, max = 100) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max) + '...';
}

export default function QuestionsPage() {
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState({
    title: '',
    question: '',
    category: 'Technical',
    difficulty: 'Medium',
    answer: '',
  });
  const [activeField, setActiveField] = useState('question');

  const loadQuestions = () => {
    api.getQuestions().then(setQuestions).catch((err) => toast.error(err.message));
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleSpeechResult = useCallback((transcript) => {
    setForm((f) => ({
      ...f,
      [activeField]: f[activeField] + (f[activeField] ? ' ' : '') + transcript,
    }));
  }, [activeField]);

  const speech = useSpeechToText(handleSpeechResult);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterCategory && q.category !== filterCategory) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const titleMatch = q.title?.toLowerCase().includes(s);
        const questionMatch = q.question.toLowerCase().includes(s);
        const answerMatch = q.answer?.toLowerCase().includes(s);
        if (!titleMatch && !questionMatch && !answerMatch) return false;
      }
      return true;
    });
  }, [questions, filterCategory, filterDifficulty, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createQuestion(form);
      setForm({ title: '', question: '', category: 'Technical', difficulty: 'Medium', answer: '' });
      setShowForm(false);
      if (speech.listening) speech.toggle();
      loadQuestions();
      toast.success('Question added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteQuestion(id);
      loadQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayTitle = (q) => q.title || truncate(q.question, 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Interview Questions</h1>
          <p className="text-ink-muted mt-0.5">Question bank for preparation</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question-title" className="label">Title (short summary)</label>
              <input
                id="question-title"
                type="text"
                className="input"
                placeholder="e.g. Explain closures in JavaScript"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={200}
              />
              <p className="text-xs text-ink-light mt-1">Optional — if left blank, the first 100 characters of the question will be shown</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="question-text" className="text-sm font-medium text-ink">Question</label>
                {speech.supported && (
                  <button
                    type="button"
                    onClick={() => { setActiveField('question'); speech.toggle(); }}
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      speech.listening && activeField === 'question'
                        ? 'bg-danger-light text-danger'
                        : 'bg-surface-muted text-ink-muted hover:text-ink'
                    }`}
                  >
                    {speech.listening && activeField === 'question' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {speech.listening && activeField === 'question' ? 'Stop' : 'Voice'}
                  </button>
                )}
              </div>
              <textarea
                id="question-text"
                className="input min-h-[80px] resize-y"
                placeholder="Enter the full interview question..."
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                onFocus={() => setActiveField('question')}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="question-category" className="label">Category</label>
                <select
                  id="question-category"
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="question-difficulty" className="label">Difficulty</label>
                <select
                  id="question-difficulty"
                  className="input"
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="question-answer" className="text-sm font-medium text-ink">Answer / Notes (optional)</label>
                {speech.supported && (
                  <button
                    type="button"
                    onClick={() => { setActiveField('answer'); speech.toggle(); }}
                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      speech.listening && activeField === 'answer'
                        ? 'bg-danger-light text-danger'
                        : 'bg-surface-muted text-ink-muted hover:text-ink'
                    }`}
                  >
                    {speech.listening && activeField === 'answer' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {speech.listening && activeField === 'answer' ? 'Stop' : 'Voice'}
                  </button>
                )}
              </div>
              <textarea
                id="question-answer"
                className="input min-h-[80px] resize-y"
                placeholder="Enter the answer or notes..."
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                onFocus={() => setActiveField('answer')}
              />
            </div>
            {speech.listening && (
              <div className="flex items-center gap-2 text-xs text-danger animate-pulse">
                <Mic className="w-3.5 h-3.5" />
                Listening... speak into your microphone ({activeField === 'question' ? 'Question' : 'Answer'} field)
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); if (speech.listening) speech.toggle(); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Question</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-10">
            <HelpCircle className="w-10 h-10 text-ink-light mx-auto mb-3" />
            <p className="text-ink-muted text-sm">No questions found</p>
          </div>
        ) : (
          filtered.map((q) => (
            <div key={q.id} className="card">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="mt-0.5 cursor-pointer text-ink-muted hover:text-ink transition-colors duration-150"
                  aria-label={expanded[q.id] ? 'Collapse' : 'Expand'}
                >
                  {expanded[q.id] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{displayTitle(q)}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`badge ${categoryColor[q.category] || ''}`}>{q.category}</span>
                    <span className={`badge ${difficultyColor[q.difficulty] || ''}`}>{q.difficulty}</span>
                  </div>
                  {expanded[q.id] && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      {q.title && (
                        <div>
                          <p className="text-xs font-medium text-ink-muted mb-1">Full Question</p>
                          <p className="text-sm text-ink whitespace-pre-wrap">{q.question}</p>
                        </div>
                      )}
                      {!q.title && q.question.length > 100 && (
                        <div>
                          <p className="text-xs font-medium text-ink-muted mb-1">Full Question</p>
                          <p className="text-sm text-ink whitespace-pre-wrap">{q.question}</p>
                        </div>
                      )}
                      {q.answer && (
                        <div>
                          <p className="text-xs font-medium text-ink-muted mb-1">Answer / Notes</p>
                          <p className="text-sm text-ink whitespace-pre-wrap">{q.answer}</p>
                        </div>
                      )}
                      {!q.title && q.question.length <= 100 && !q.answer && (
                        <p className="text-xs text-ink-light">No additional details</p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="btn-ghost p-2 text-danger hover:bg-danger-light flex-shrink-0"
                  aria-label="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
