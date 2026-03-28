import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { loadIssues } from '../services/DataLoader';
import { isValidZip, resolve } from '../engines/LocationResolver';
import type { IssueScore, IssueStatement } from '../types';

const SCORE_LABELS: Record<number, string> = { 1: 'Agree', '-1': 'Disagree', 0: 'Skipped' };
const SCORE_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700 border-green-300',
  '-1': 'bg-red-100 text-red-600 border-red-300',
  0: 'bg-gray-100 text-gray-500 border-gray-300',
};

export default function ProfilePage() {
  const { userName, setUserName, email, setEmail, location, setLocation, issueProfile, setIssueProfile, quizComplete } = useAppContext();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(email);
  const [editingZip, setEditingZip] = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [zipError, setZipError] = useState('');

  const issues: IssueStatement[] = useMemo(() => loadIssues(), []);

  // Group issues by category
  const grouped = useMemo(() => {
    const map = new Map<string, IssueStatement[]>();
    for (const issue of issues) {
      const list = map.get(issue.category) ?? [];
      list.push(issue);
      map.set(issue.category, list);
    }
    return map;
  }, [issues]);

  function saveName() {
    setUserName(nameInput.trim());
    setEditingName(false);
  }

  function saveEmailField() {
    setEmail(emailInput.trim());
    setEditingEmail(false);
  }

  function saveZip() {
    setZipError('');
    if (!isValidZip(zipInput)) {
      setZipError('Enter a valid 5-digit ZIP code.');
      return;
    }
    const result = resolve(zipInput);
    if (!result) {
      setZipError('ZIP code not recognized. Try another.');
      return;
    }
    setLocation(result);
    setEditingZip(false);
    setZipInput('');
  }

  function cycleScore(issueId: string) {
    const current = issueProfile[issueId] ?? 0;
    const next: IssueScore = current === 1 ? -1 : current === -1 ? 0 : 1;
    setIssueProfile({ ...issueProfile, [issueId]: next });
  }

  return (
    <div className="min-h-dvh pb-16">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          Profile &amp; Settings
        </h1>

        {/* Name section */}
        <section className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-semibold text-[#274C77] uppercase tracking-wide">Your Info</h2>

          <div className="flex items-center gap-3">
            {editingName ? (
              <>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  placeholder="Enter your name"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6096BA]"
                  aria-label="Your name"
                />
                <button type="button" onClick={saveName} className="px-4 py-2 rounded-lg bg-[#274C77] text-white text-sm font-medium hover:bg-[#274C77]/90 transition">
                  Save
                </button>
                <button type="button" onClick={() => { setEditingName(false); setNameInput(userName); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-text-primary">{userName || <span className="text-gray-400 italic">No name set</span>}</span>
                <button type="button" onClick={() => setEditingName(true)} className="px-4 py-2 rounded-lg border border-[#6096BA] text-[#274C77] text-sm font-medium hover:bg-[#6096BA]/10 transition">
                  Edit
                </button>
              </>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            {editingEmail ? (
              <>
                <input
                  autoFocus
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEmailField()}
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6096BA]"
                  aria-label="Your email"
                />
                <button type="button" onClick={saveEmailField} className="px-4 py-2 rounded-lg bg-[#274C77] text-white text-sm font-medium hover:bg-[#274C77]/90 transition">
                  Save
                </button>
                <button type="button" onClick={() => { setEditingEmail(false); setEmailInput(email); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-text-primary">{email || <span className="text-gray-400 italic">No email set</span>}</span>
                <button type="button" onClick={() => setEditingEmail(true)} className="px-4 py-2 rounded-lg border border-[#6096BA] text-[#274C77] text-sm font-medium hover:bg-[#6096BA]/10 transition">
                  Edit
                </button>
              </>
            )}
          </div>

          {/* Location */}
          {location && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              {editingZip ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={zipInput}
                      onChange={e => { setZipInput(e.target.value.replace(/\D/g, '')); setZipError(''); }}
                      onKeyDown={e => e.key === 'Enter' && saveZip()}
                      maxLength={5}
                      inputMode="numeric"
                      placeholder="e.g. 90210"
                      className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6096BA]"
                      aria-label="New ZIP code"
                    />
                    <button type="button" onClick={saveZip} className="px-4 py-2 rounded-lg bg-[#274C77] text-white text-sm font-medium hover:bg-[#274C77]/90 transition">
                      Update
                    </button>
                    <button type="button" onClick={() => { setEditingZip(false); setZipInput(''); setZipError(''); }} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                  {zipError && <p className="text-xs text-red-500">{zipError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="flex-1 text-sm text-text-primary">{location.city}, {location.county}, {location.state}</p>
                  <button
                    type="button"
                    onClick={() => setEditingZip(true)}
                    className="px-4 py-2 rounded-lg border border-[#6096BA] text-[#274C77] text-sm font-medium hover:bg-[#6096BA]/10 transition"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Preferences section */}
        <section className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#274C77] uppercase tracking-wide">Your Preferences</h2>
            {quizComplete && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Quiz completed</span>
            )}
          </div>

          {!quizComplete ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-gray-500">You haven't completed the vibe check yet.</p>
              <button
                type="button"
                onClick={() => navigate('/vibe-check')}
                className="px-5 py-2 rounded-lg bg-[#274C77] text-white text-sm font-medium hover:bg-[#274C77]/90 transition"
              >
                Take the Vibe Check
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Click any preference to cycle through: Agree → Disagree → Skip</p>

              {Array.from(grouped.entries()).map(([category, categoryIssues]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-[#6096BA] mb-2">{category}</h3>
                  <div className="space-y-2">
                    {categoryIssues.map(issue => {
                      const score = issueProfile[issue.id] ?? 0;
                      return (
                        <button
                          key={issue.id}
                          type="button"
                          onClick={() => cycleScore(issue.id)}
                          className="w-full text-left flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition group"
                          aria-label={`${issue.text} — currently ${SCORE_LABELS[score]}. Click to change.`}
                        >
                          <span className="flex-1 text-sm text-text-primary leading-snug">{issue.text}</span>
                          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${SCORE_COLORS[score]} group-hover:ring-2 group-hover:ring-[#6096BA]/30 transition`}>
                            {SCORE_LABELS[score]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/vibe-check')}
                  className="px-4 py-2 rounded-lg border border-[#6096BA] text-[#274C77] text-sm font-medium hover:bg-[#6096BA]/10 transition"
                >
                  Retake Quiz
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/results')}
                  className="px-4 py-2 rounded-lg bg-[#274C77] text-white text-sm font-medium hover:bg-[#274C77]/90 transition"
                >
                  View Updated Results
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
