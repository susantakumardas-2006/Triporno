import { X, Loader2, Shield, Brain } from 'lucide-react';

interface DefenderModalProps {
  session: {
    sessionId: string;
    firstQuestion: {
      id: string;
      level: string;
      question: string;
      expectedConcepts: string[];
      conceptTags: string[];
      toughnessRating?: number;
    };
    estimatedTime: number;
  };
  onComplete: () => void;
  onClose: () => void;
}

export default function DefenderModal({ session, onComplete, onClose }: DefenderModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(session.firstQuestion);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [defense, setDefense] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{ result: string; confidence: number; feedback: string } | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSubmitDefense = async () => {
    if (!defense.trim()) return;
    
    setIsEvaluating(true);
    setEvaluation(null);
    
    try {
      const res = await fetch('/api/socratic/evaluate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          questionId: currentQuestion.id,
          studentResponse: defense
        })
      });
      const data = await res.json();
      setEvaluation({ result: data.evaluation, confidence: data.confidence, feedback: data.feedback });
    } catch (e) {
      setEvaluation({ result: 'partial', confidence: 0.5, feedback: 'Evaluation failed, using default.' });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = async () => {
    setEvaluation(null);
    setDefense('');
    
    try {
      const res = await fetch('/api/socratic/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          confidence: evaluation?.confidence || 0.5
        })
      });
      const data = await res.json();
      
      if (data.isFinal) {
        await completeSession();
      } else {
        setCurrentQuestion(data.question);
        setQuestionIndex(i => i + 1);
      }
    } catch (e) {
      // fallback
      setShowReport(true);
    }
  };

  const completeSession = async () => {
    try {
      const res = await fetch('/api/socratic/complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId })
      });
      const data = await res.json();
      setReport(data.report);
      setShowReport(true);
    } catch (e) {
      setReport({ outcome: 'inconclusive', masteryDelta: {}, strengths: [], gaps: [], recommendedVideos: [], recommendedProblems: [], nextSteps: [], summary: 'Session completed.' });
      setShowReport(true);
    }
  };

  const handleSkip = async () => {
    setEvaluation(null);
    setDefense('');
    
    try {
      const res = await fetch('/api/socratic/skip-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, questionId: currentQuestion.id })
      });
      const data = await res.json();
      
      if (data.isFinal) {
        await completeSession();
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionIndex(i => i + 1);
      }
    } catch (e) {
      // fallback
    }
  };

  const handleForceExit = async () => {
    try {
      const res = await fetch('/api/socratic/force-exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId })
      });
      const data = await res.json();
      setReport(data.report);
      setShowReport(true);
    } catch (e) {
      setReport({ outcome: 'inconclusive', masteryDelta: {}, strengths: [], gaps: [], recommendedVideos: [], recommendedProblems: [], nextSteps: [], summary: 'Session ended early.' });
      setShowReport(true);
    }
  };

  if (showReport && report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="liquid-glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="text-emerald-400" size={24} />
              Defender Report
            </h2>
            <button onClick={onComplete} className="text-white/60 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl ${report.outcome === 'deep-understanding' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
              <div className="flex items-center gap-3 mb-2">
                {report.badge === 'deep-understanding' ? (
                  <Brain className="text-emerald-400" size={24} />
                ) : (
                  <span className="text-amber-400">⚠</span>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {report.outcome === 'deep-understanding' ? 'Deep Understanding Demonstrated' : 'Gaps Identified'}
                  </p>
                  <p className="text-white/60 text-sm">{report.summary}</p>
                </div>
              </div>
            </div>

            {report.masteryDelta && Object.keys(report.masteryDelta).length > 0 && (
              <div className="liquid-glass rounded-2xl p-4">
                <h3 className="font-semibold mb-3">Mastery Change</h3>
                <div className="grid gap-2">
                  {Object.entries(report.masteryDelta).map(([topic, delta]: [string, unknown]) => {
                    const numDelta = Number(delta);
                    return (
                      <div key={topic} className="flex justify-between">
                        <span>{topic}</span>
                        <span className={numDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {numDelta > 0 ? '+' : ''}{Math.round(numDelta)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {report.gaps.length > 0 && (
              <div className="liquid-glass rounded-2xl p-4">
                <h3 className="font-semibold mb-3 text-red-400">Gaps Identified</h3>
                <ul className="space-y-1">
                  {report.gaps.map((gap: string, i: number) => (
                    <li key={i} className="text-white/70 text-sm">• {gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendedVideos.length > 0 && (
              <div className="liquid-glass rounded-2xl p-4">
                <h3 className="font-semibold mb-3">Recommended Videos</h3>
                <div className="space-y-2">
                  {report.recommendedVideos.slice(0, 3).map((vid: any) => (
                    <a key={vid.id} href={vid.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
                      <div className="w-16 h-9 bg-red-600 rounded flex items-center justify-center text-xs">▶</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{vid.title}</p>
                        <p className="text-xs text-white/50">{vid.duration}s • {vid.difficulty}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {report.recommendedProblems.length > 0 && (
              <div className="liquid-glass rounded-2xl p-4">
                <h3 className="font-semibold mb-3">Recommended Problems</h3>
                <div className="space-y-2">
                  {report.recommendedProblems.slice(0, 3).map((prob: any) => (
                    <div key={prob.id} className="p-2 rounded-xl bg-white/5">
                      <p className="font-medium">{prob.title}</p>
                      <p className="text-xs text-white/50">{prob.conceptTags.join(', ')} • {prob.seedTier}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={onComplete} className="w-full bg-white text-black rounded-full py-3 font-semibold mt-6">
              Continue Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="liquid-glass rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/60 text-sm">Socratic Defender</p>
            <h2 className="text-2xl font-semibold">Defend Your Reasoning</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">Question {questionIndex + 1}</span>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="liquid-glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                currentQuestion.level === 'easy' ? 'bg-emerald-500/30 text-emerald-400' :
                currentQuestion.level === 'medium' ? 'bg-amber-500/30 text-amber-400' :
                currentQuestion.level === 'hard' ? 'bg-orange-500/30 text-orange-400' :
                'bg-red-500/30 text-red-400'
              }`}>
                {currentQuestion.level.toUpperCase()}
              </span>
              <span className="text-white/50 text-sm">{currentQuestion.conceptTags.join(' • ')}</span>
            </div>
            <p className="text-white text-lg leading-relaxed">{currentQuestion.question}</p>
            {currentQuestion.expectedConcepts.length > 0 && (
              <p className="text-white/50 text-sm mt-3">Key concepts: {currentQuestion.expectedConcepts.join(', ')}</p>
            )}
          </div>

          <div className="liquid-glass rounded-2xl p-5">
            <label className="block text-white/70 text-sm mb-3">Your Defense</label>
            <textarea
              value={defense}
              onChange={(e) => setDefense(e.target.value)}
              className="w-full h-48 rounded-xl bg-white/10 p-4 outline-none text-white placeholder:text-white/40 resize-none"
              placeholder="Explain your reasoning step by step..."
              disabled={isEvaluating || !!evaluation}
            />
            {evaluation && (
              <div className={`mt-4 p-4 rounded-xl ${
                evaluation.result === 'understood' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                evaluation.result === 'partial' ? 'bg-amber-500/20 border border-amber-500/30' :
                'bg-red-500/20 border border-red-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold capitalize">{evaluation.result}</span>
                  <span className="text-white/50 text-sm">Confidence: {Math.round(evaluation.confidence * 100)}%</span>
                </div>
                <p className="text-white/80">{evaluation.feedback}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {evaluation ? (
              <>
                <button onClick={handleNext} className="flex-1 bg-white text-black rounded-full py-3 font-semibold">
                  Next Question
                </button>
                <button onClick={handleSkip} className="flex-1 rounded-full border border-white/20 py-3 font-semibold">
                  Skip (-3 mastery)
                </button>
              </>
            ) : (
              <button 
                onClick={handleSubmitDefense} 
                disabled={isEvaluating || !defense.trim()}
                className="flex-1 bg-white text-black rounded-full py-3 font-semibold disabled:opacity-50"
              >
                {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Defense'}
              </button>
            )}
            <button onClick={handleForceExit} className="rounded-full border border-red-500/30 text-red-400 py-3 px-6 font-semibold">
              Force Exit (-8 mastery)
            </button>
          </div>

          <div className="text-center text-white/50 text-xs">
            <p>Question {questionIndex + 1} • Session: {session.sessionId.slice(-8)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';