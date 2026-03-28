import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateLearningRecommendations } from '../engines/LearningRecommendationEngine';
import { loadIssues, loadRealCandidates } from '../services/DataLoader';
import CandidateCard from './CandidateCard';
import type { Candidate, MatchResult } from '../types';

export default function CivicMatchResults() {
  const { location, issueProfile } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'matches' | 'learn'>('matches');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const issues = useMemo(() => loadIssues(), []);

  // Load candidates from mock data
  useEffect(() => {
    async function fetchCandidates() {
      if (!location) return;
      
      setLoading(true);
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Load mock candidates with photos
        const mockCandidates = (await import('../data/candidates.json')).default as Candidate[];
        
        // Filter by location
        const filtered = mockCandidates.filter(
          c => c.state === location.state && c.county === location.county
        );
        
        setCandidates(filtered.length > 0 ? filtered : mockCandidates);
      } catch (error) {
        console.error('Failed to load candidates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCandidates();
  }, [location]);

  const results = useMemo(() => {
    if (!location || candidates.length === 0) return [];
    
    // Filter candidates by location
    const localCandidates = candidates.filter(
      (c) =>
        c.state.toLowerCase() === location.state.toLowerCase() &&
        c.county.toLowerCase() === location.county.toLowerCase(),
    );

    // Compute matches
    return localCandidates
      .map((candidate): MatchResult => {
        const agreements: string[] = [];
        const disagreements: string[] = [];
        let answered = 0;
        let matching = 0;

        for (const [issueId, userScore] of Object.entries(issueProfile)) {
          if (userScore === 0) continue;
          const candidateScore = candidate.positions[issueId];
          if (candidateScore === undefined || candidateScore === 0) continue;

          answered++;
          if (userScore === candidateScore) {
            matching++;
            agreements.push(issueId);
          } else {
            disagreements.push(issueId);
          }
        }

        const matchPercentage = answered > 0 ? Math.round((matching / answered) * 100) : 0;

        return {
          candidate,
          matchPercentage,
          agreements: agreements.slice(0, 3),
          disagreements: disagreements.slice(0, 2),
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [candidates, issueProfile, location]);

  const learningRecs = useMemo(() => {
    return generateLearningRecommendations(issueProfile, issues);
  }, [issueProfile, issues]);

  const allSkipped = Object.values(issueProfile).every((s) => s === 0);

  if (!location) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <p className="text-slate">Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light text-cream">Your Results</h1>
          <p className="mt-2 text-sm text-slate">
            {location.city}, {location.state} · {location.county} County
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-glass-border">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'matches'
                ? 'border-b-2 border-teal text-cream bg-teal/10'
                : 'text-slate hover:text-cream hover:bg-glass-bg'
            }`}
          >
            Candidate Matches
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'learn'
                ? 'border-b-2 border-teal text-cream bg-teal/10'
                : 'text-slate hover:text-cream hover:bg-glass-bg'
            }`}
          >
            Learn More
          </button>
        </div>

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            {/* Disclaimer banner */}
            <div className="mb-6 rounded-xl border border-glass-border bg-glass-bg px-4 py-3 backdrop-blur-sm">
              <p className="text-xs leading-relaxed text-slate">
                Match scores reflect issue agreement and are not endorsements. They represent
                values alignment based on your responses, not voting recommendations.
              </p>
            </div>

            {/* Edge case: all issues skipped */}
            {allSkipped && (
              <div className="mb-6 rounded-xl border border-slate/30 bg-slate/10 px-4 py-4 text-center backdrop-blur-sm">
                <p className="text-sm text-slate">
                  You skipped all issues, so match scores are 0%. Go back and share your takes for
                  better results.
                </p>
              </div>
            )}

            {/* Edge case: no candidates found */}
            {results.length === 0 && !allSkipped && (
              <div className="mb-6 rounded-xl border border-glass-border bg-glass-bg px-4 py-4 text-center backdrop-blur-sm">
                <p className="text-sm text-slate">
                  No candidates found for your area. We're working on expanding coverage.
                </p>
              </div>
            )}

            {/* Candidate list */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate">Loading candidates...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4" role="list" aria-label="Candidate matches">
                {results.map((r) => (
                  <div key={r.candidate.id} role="listitem">
                    <CandidateCard
                      result={r}
                      issues={issues}
                      onTap={(id) => navigate(`/candidate/${id}`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div>
            <p className="text-sm text-slate mb-6">
              Based on your responses, here are personalized topics to help you become more politically informed.
            </p>

            {learningRecs.length === 0 ? (
              <div className="rounded-xl border border-glass-border bg-glass-bg px-6 py-8 text-center backdrop-blur-sm">
                <p className="text-slate">No recommendations available. Complete the quiz to get personalized learning suggestions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {learningRecs.map((rec, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border backdrop-blur-sm p-5 transition hover:scale-[1.01] ${
                      rec.priority === 'high'
                        ? 'border-teal/40 bg-teal/10'
                        : rec.priority === 'medium'
                        ? 'border-lavender/30 bg-lavender/5'
                        : 'border-glass-border bg-glass-bg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-medium text-cream">{rec.category}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        rec.priority === 'high'
                          ? 'bg-teal/20 text-teal border border-teal/30'
                          : rec.priority === 'medium'
                          ? 'bg-lavender/20 text-lavender border border-lavender/30'
                          : 'bg-slate/20 text-slate border border-slate/30'
                      }`}>
                        {rec.priority === 'high' ? 'Start Here' : rec.priority === 'medium' ? 'Explore' : 'Deepen'}
                      </span>
                    </div>
                    <p className="text-sm text-slate mb-4">{rec.reason}</p>
                    <div className="space-y-2">
                      {rec.topics.map((topic, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-cream">
                          <span className="text-teal mt-1 flex-shrink-0">→</span>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
