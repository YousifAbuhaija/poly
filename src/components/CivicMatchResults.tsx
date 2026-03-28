import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { computeMatches } from '../engines/CivicMatchEngine';
import { loadIssues } from '../services/DataLoader';
import CandidateCard from './CandidateCard';

export default function CivicMatchResults() {
  const { location, issueProfile, userName } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'matches' | 'news'>('matches');
  const firstName = userName?.split(' ')[0] || '';
  const issues = useMemo(() => loadIssues(), []);
  const results = useMemo(() => {
    if (!location) return [];
    const allMatches = computeMatches(issueProfile, location);
    return allMatches.slice(0, 5); // Show only top 5
  }, [issueProfile, location]);

  const allSkipped = Object.values(issueProfile).every((s) => s === 0);

  // Mock news data - in production, this would come from an API
  const newsItems = [
    {
      id: 1,
      title: "Partial Road Closure: Lark Ln. – March 31 – April 6",
      date: "03/27/2026",
      summary: "There will be a partial closure on Lark Lane between Gladewood Drive and Glade Road on March 31 – April 6 from 8am-5pm. Flagging crews will be on site to direct traffic around the closure.",
      category: "Infrastructure"
    },
    {
      id: 2,
      title: "UPDATE: Partial Closure Fairfax, New Kent and Sussex Rd. – March 30 – April 2",
      date: "03/27/2026",
      summary: "There will be partial closures on Fairfax and New Kent Road between Ellett and Loudon Road and partial closures along Sussex Road between New Kent Road and Cedar Hill Drive on March 30 – April 2 from 8am-4pm.",
      category: "Infrastructure"
    },
    {
      id: 3,
      title: "Industrial Park Road Lane Closure: March 30 – April 1",
      date: "03/27/2026",
      summary: "Beginning Monday, March 30, Public Works crews will complete road repair work at the intersection of Industrial Park Road and Prosperity Road. The road will be closed one lane at a time to complete the work.",
      category: "Public Works"
    }
  ];

  if (!location) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-text-secondary text-sm">Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#6096BA]/15 to-[#A3CEF1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#274C77]/15 to-[#6096BA]/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        className="relative z-10 mx-auto max-w-4xl px-6 py-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Page header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold" style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {firstName ? `${firstName}'s Matches` : 'Your Matches'}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#E7ECEF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {location.city}, {location.state} · {location.county} County
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b-2 border-[#2E2F2F]">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'matches'
                  ? 'border-[#051014] text-[#051014] bg-white'
                  : 'border-transparent text-[#CDDDDD] hover:text-white hover:border-[#CDDDDD]'
              }`}
            >
              Your Matches
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'news'
                  ? 'border-[#051014] text-[#051014] bg-white'
                  : 'border-transparent text-[#CDDDDD] hover:text-white hover:border-[#CDDDDD]'
              }`}
            >
              Recent News
            </button>
          </div>
        </div>

        {/* Matches Tab Content */}
        {activeTab === 'matches' && (
          <>
            {/* Disclaimer */}
            <motion.div 
              className="mb-6 rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-sm border border-white/30 px-5 py-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-xs text-gray-600 leading-relaxed">
                Match scores reflect issue agreement and are not endorsements. They represent values alignment based on your responses, not voting recommendations.
              </p>
            </motion.div>

            {allSkipped && (
              <motion.div 
                className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <p className="text-sm text-amber-700">
                  You skipped all questions - match scores are 0%. Retake the quiz to get better results.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/vibe-check')}
                  className="mt-2 text-sm font-semibold text-brand-purple hover:underline"
                >
                  Retake quiz →
                </button>
              </motion.div>
            )}

            {results.length === 0 && !allSkipped && (
              <motion.div 
                className="rounded-xl bg-white/80 backdrop-blur-sm border border-surface-border px-5 py-8 text-center shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <p className="text-text-secondary text-sm">No candidates found for your area. We're working on expanding coverage.</p>
              </motion.div>
            )}

            {/* Results grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Candidate matches">
              {results.map((r, index) => (
                <motion.div 
                  key={r.candidate.id} 
                  role="listitem"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                >
                  <CandidateCard result={r} issues={issues} onTap={(id) => navigate(`/candidate/${id}`)} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* News Tab Content */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="mb-4 bg-[#CDDDDD] border-l-4 border-[#051014] px-4 py-3">
              <p className="text-sm text-[#051014] font-medium">
                Local news and updates from {location.city}, {location.state}
              </p>
            </div>

            {newsItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#2E2F2F] p-6"
              >
                <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-[#CDDDDD]">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#051014]">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#2E2F2F]">{item.date}</span>
                </div>
                <h3 className="text-lg font-bold text-[#051014] mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-[#2E2F2F] leading-relaxed">
                  {item.summary}
                </p>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-[#2E2F2F]">
              <p className="text-xs text-[#CDDDDD]">
                Source: Town of {location.city} Official Website
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
