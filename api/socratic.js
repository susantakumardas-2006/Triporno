const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'database');

function readJSON(filename) {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function writeJSON(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function generateId(prefix = 'sess') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getInstituteSettings(studentId) {
  const students = readJSON('students.json');
  const student = students.find(s => s.id === studentId);
  if (!student?.instituteId) return null;
  
  const institutes = readJSON('institutes.json');
  const institute = institutes.find(i => i.id === student.instituteId);
  return institute?.defenderSettings || {
    masteryThreshold: 75,
    confidenceThreshold: 0.75,
    maxQuestions: 6,
    minQuestions: 3,
    skipPenalty: -3,
    forceExitPenalty: -8,
    timerEnabled: true,
    timerBase: 180,
    enrichmentMode: true
  };
}

function getTopicProgress(studentId, topic) {
  const progress = readJSON('topicProgress.json');
  return progress[studentId]?.[topic] || {
    totalSolved: 0,
    masteryScore: 50,
    defenderPassCount: 0,
    defenderFailCount: 0,
    skipCount: 0,
    forceExitCount: 0
  };
}

function updateTopicProgress(studentId, topic, updates) {
  const progress = readJSON('topicProgress.json');
  if (!progress[studentId]) progress[studentId] = {};
  if (!progress[studentId][topic]) {
    progress[studentId][topic] = {
      totalSolved: 0,
      masteryScore: 50,
      defenderPassCount: 0,
      defenderFailCount: 0,
      skipCount: 0,
      forceExitCount: 0
    };
  }
  progress[studentId][topic] = { ...progress[studentId][topic], ...updates };
  writeJSON('topicProgress.json', progress);
}

function getVideoLessons(filters = {}) {
  const data = readJSON('videoLessons.json');
  let videos = data.videos || [];
  
  if (filters.topic) {
    videos = videos.filter(v => v.topic.toLowerCase() === filters.topic.toLowerCase());
  }
  if (filters.domain) {
    videos = videos.filter(v => v.domain.toLowerCase() === filters.domain.toLowerCase());
  }
  if (filters.concept) {
    videos = videos.filter(v => v.concept.toLowerCase().includes(filters.concept.toLowerCase()));
  }
  if (filters.difficulty) {
    videos = videos.filter(v => v.difficulty === filters.difficulty);
  }
  
  return videos;
}

function getProblemsForRemediation(gaps, studentMastery) {
  const problems = readJSON('problems.json');
  const isWeak = studentMastery < 60;
  
  return problems
    .filter(p => {
      if (!p.remediationPool) return false;
      if (isWeak && p.remediationLevel !== 'basic') return false;
      if (!isWeak && p.remediationLevel === 'basic') return false;
      return p.conceptTags.some(tag => gaps.some(g => g.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(g.toLowerCase())));
    })
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      conceptTags: p.conceptTags,
      seedTier: p.seedTier,
      liveToughnessRating: p.liveToughnessRating,
      remediationLevel: p.remediationLevel,
      isRemediation: true
    }));
}

function getProblemsForEnrichment(strengths, studentMastery) {
  const problems = readJSON('problems.json');
  const isStrong = studentMastery > 80;
  
  return problems
    .filter(p => {
      if (!p.enrichmentPool) return false;
      if (isStrong && p.enrichmentLevel !== 'advanced' && p.enrichmentLevel !== 'expert') return false;
      if (!isStrong && p.enrichmentLevel === 'expert') return false;
      return p.conceptTags.some(tag => strengths.some(s => s.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(s.toLowerCase())));
    })
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      conceptTags: p.conceptTags,
      seedTier: p.seedTier,
      liveToughnessRating: p.liveToughnessRating,
      enrichmentLevel: p.enrichmentLevel,
      isRemediation: false
    }));
}

function generateMockQuestion(topic, domain, level, previousLevel, questionIndex) {
  const questionBank = {
    'Algebra': {
      easy: [
        'What does the discriminant tell you about the nature of roots in a quadratic equation?',
        'Why do we use the quadratic formula instead of factoring for all quadratics?',
        'Explain what happens when the discriminant is negative.'
      ],
      medium: [
        'How does the vertex form of a quadratic relate to the discriminant?',
        'If a quadratic has discriminant 0, what does that mean geometrically?',
        'How does completing the square connect to the quadratic formula?'
      ],
      hard: [
        'Design a quadratic with no real roots and vertex at (2,3). Explain your reasoning.',
        'How does the discriminant change when you translate a quadratic horizontally vs vertically?',
        'Prove that if a quadratic has integer coefficients and rational roots, the discriminant must be a perfect square.'
      ],
      expert: [
        'Generalize the discriminant concept to cubic equations. What does it tell you?',
        'How does the discriminant relate to the resultant of a polynomial and its derivative?'
      ]
    },
    'Calculus': {
      easy: [
        'What does the derivative of a function represent geometrically?',
        'Why does the power rule work for x^n?',
        'What is the derivative of a constant function and why?'
      ],
      medium: [
        'How does the chain rule relate to function composition?',
        'Explain the difference between average rate of change and instantaneous rate of change.',
        'Why does the derivative of e^x equal e^x?'
      ],
      hard: [
        'Prove the derivative of ln(x) is 1/x using the definition of derivative.',
        'Explain why L\'Hôpital\'s rule works and when it fails.',
        'How does the Mean Value Theorem connect average and instantaneous rates?'
      ],
      expert: [
        'Generalize the Fundamental Theorem of Calculus to line integrals.',
        'How does the Taylor series relate to the concept of local linearity?'
      ]
    },
    'Mechanics': {
      easy: [
        'What is the difference between speed and velocity?',
        'Explain Newton\'s First Law in your own words.',
        'What does it mean for an object to be in equilibrium?'
      ],
      medium: [
        'How does the work-energy theorem connect force and kinetic energy?',
        'Explain the difference between static and kinetic friction.',
        'How does momentum conservation apply in a two-body collision?'
      ],
      hard: [
        'Derive the formula for centripetal acceleration using calculus.',
        'Explain why angular momentum is conserved but kinetic energy may not be in inelastic collisions.',
        'How does the Lagrangian formulation differ from Newtonian mechanics?'
      ],
      expert: [
        'Explain Noether\'s theorem and its connection to conservation laws.',
        'How does Hamiltonian mechanics generalize to quantum mechanics?'
      ]
    }
  };

  const bank = questionBank[topic] || questionBank['Algebra'];
  const levelQuestions = bank[level] || bank['easy'];
  const question = levelQuestions[questionIndex % levelQuestions.length];
  
  const expectedConceptsMap = {
    'Algebra': {
      easy: ['discriminant', 'roots', 'quadratic formula'],
      medium: ['vertex form', 'discriminant', 'completing the square'],
      hard: ['vertex form', 'discriminant negative', 'completing the square', 'translation'],
      expert: ['cubic discriminant', 'resultant', 'polynomial derivative']
    },
    'Calculus': {
      easy: ['derivative', 'slope', 'tangent line', 'power rule'],
      medium: ['chain rule', 'function composition', 'rate of change', 'e^x'],
      hard: ['logarithmic derivative', 'L\'Hôpital\'s rule', 'Mean Value Theorem'],
      expert: ['Fundamental Theorem', 'line integrals', 'Taylor series', 'local linearity']
    },
    'Mechanics': {
      easy: ['speed', 'velocity', 'Newton\'s First Law', 'equilibrium'],
      medium: ['work-energy theorem', 'friction', 'momentum conservation', 'collision'],
      hard: ['centripetal acceleration', 'angular momentum', 'Lagrangian mechanics'],
      expert: ['Noether\'s theorem', 'Hamiltonian mechanics', 'quantum mechanics']
    }
  };

  const expected = expectedConceptsMap[topic]?.[level] || ['concept understanding', 'reasoning', 'application'];
  
  return {
    id: `q-${generateId()}`,
    level,
    question,
    expectedConcepts: expected,
    conceptTags: [topic, domain],
    toughnessRating: level === 'easy' ? 1200 : level === 'medium' ? 1450 : level === 'hard' ? 1650 : 1800
  };
}

function calculateConfidence(evaluation, timeSpent, expectedTime) {
  const baseScore = {
    'understood': 0.9,
    'partial': 0.5,
    'misunderstood': 0.15
  }[evaluation] || 0.5;
  
  const timeRatio = Math.min(timeSpent / (expectedTime || 180), 2);
  const timeFactor = timeRatio < 1 ? 1.1 : 1 / timeRatio;
  
  return Math.min(Math.max(baseScore * timeFactor, 0), 1);
}

function shouldContinue(questions, settings) {
  if (questions.length >= settings.maxQuestions) return false;
  if (questions.length < settings.minQuestions) return true;
  
  const avgConfidence = questions.reduce((sum, q) => sum + (q.confidence || 0), 0) / questions.length;
  return avgConfidence < settings.confidenceThreshold;
}

function getNextLevel(currentLevel, evaluation, questionIndex) {
  if (evaluation === 'misunderstood') return currentLevel;
  
  const levels = ['easy', 'medium', 'hard', 'expert'];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex >= levels.length - 1) return currentLevel;
  
  return levels[Math.min(currentIndex + 1, levels.length - 1)];
}

router.post('/check-trigger', async (req, res) => {
  try {
    const { studentId, topic } = req.body;
    
    if (!studentId || !topic) {
      return res.status(400).json({ error: 'studentId and topic required' });
    }
    
    const progress = getTopicProgress(studentId, topic);
    const settings = getInstituteSettings(studentId);
    
    const shouldTrigger = progress.masteryScore > settings.masteryThreshold;
    const mode = settings.enrichmentMode ? 'enrichment' : 'remediation';
    
    res.json({
      shouldTrigger,
      reason: shouldTrigger ? 'mastery_threshold_exceeded' : 'mastery_below_threshold',
      sessionId: shouldTrigger ? generateId('sess') : undefined,
      mode,
      currentMastery: progress.masteryScore,
      threshold: settings.masteryThreshold
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/start-session', async (req, res) => {
  try {
    const { studentId, topic, triggerType, selectedTopics } = req.body;
    
    if (!studentId || !topic) {
      return res.status(400).json({ error: 'studentId and topic required' });
    }
    
    const settings = getInstituteSettings(studentId);
    const progress = getTopicProgress(studentId, topic);
    const mode = settings.enrichmentMode ? 'enrichment' : 'remediation';
    
    const sessionId = generateId('sess');
    const firstQuestion = generateMockQuestion(topic, 'Math', 'easy', null, 0);
    
    const session = {
      id: sessionId,
      studentId,
      topic,
      domain: 'Math',
      triggerType: triggerType || 'auto',
      mode: 'enrichment',
      status: 'active',
      questions: [firstQuestion],
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      skippedQuestionIds: [],
      forceExited: false
    };
    
    const sessions = readJSON('defenderSessions.json');
    sessions[sessionId] = session;
    writeJSON('defenderSessions.json', sessions);
    
    const estimatedTime = 180 * 4;
    
    res.json({
      sessionId,
      firstQuestion,
      estimatedTime
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/next-question', async (req, res) => {
  try {
    const { sessionId, previousResponse, confidence } = req.body;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const settings = getInstituteSettings(session.studentId);
    const questionIndex = session.questions.length;
    const previousLevel = session.questions.length > 0 ? session.questions[session.questions.length - 1].level : null;
    const previousEvaluation = session.questions.length > 0 ? session.questions[session.questions.length - 1].evaluation : null;
    
    let nextLevel = 'easy';
    if (questionIndex === 0) {
      nextLevel = 'easy';
    } else if (previousEvaluation === 'misunderstood') {
      nextLevel = previousLevel;
    } else {
      const levels = ['easy', 'medium', 'hard', 'expert'];
      const currentIndex = ['easy', 'medium', 'hard', 'expert'].indexOf(previousLevel);
      nextLevel = levels[Math.min(currentIndex + 1, levels.length - 1)];
    }
    
    const nextQuestion = generateMockQuestion(session.topic, session.domain, nextLevel, previousLevel, questionIndex);
    nextQuestion.toughnessRating = nextLevel === 'easy' ? 1200 : nextLevel === 'medium' ? 1450 : nextLevel === 'hard' ? 1650 : 1800;
    
    const isFinal = !shouldContinue([
      ...session.questions,
      { ...nextQuestion, confidence: 0.5 }
    ], settings);
    
    session.lastActiveAt = new Date().toISOString();
    writeJSON('defenderSessions.json', { ...readJSON('defenderSessions.json'), [sessionId]: session });
    
    res.json({
      question: nextQuestion,
      isFinal: isFinal || questionIndex >= settings.maxQuestions - 1,
      questionIndex,
      totalEstimated: Math.min(settings.maxQuestions, questionIndex + 2)
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/evaluate-response', async (req, res) => {
  try {
    const { sessionId, questionId, studentResponse } = req.body;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const evaluation = Math.random() > 0.7 ? 'misunderstood' : (Math.random() > 0.4 ? 'partial' : 'understood');
    const expectedTime = 180;
    const timeSpent = Math.floor(Math.random() * 180) + 30;
    const confidence = calculateConfidence(evaluation, timeSpent, expectedTime);
    
    const feedbackMap = {
      'understood': 'Excellent! You demonstrated clear understanding of the concept.',
      'partial': 'Good start, but there are some gaps in your reasoning.',
      'misunderstood': 'There appears to be a fundamental misunderstanding. Let\'s revisit this concept.'
    };
    
    question.evaluation = evaluation;
    question.confidence = confidence;
    question.timeSpent = timeSpent;
    question.studentResponse = studentResponse;
    
    session.lastActiveAt = new Date().toISOString();
    const sessionsData = readJSON('defenderSessions.json');
    sessionsData[sessionId] = session;
    writeJSON('defenderSessions.json', sessionsData);
    
    res.json({
      evaluation,
      confidence,
      feedback: feedbackMap[evaluation],
      expectedConcepts: question.expectedConcepts
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/complete-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const settings = getInstituteSettings(session.studentId);
    const questions = session.questions;
    
    let totalDelta = 0;
    const deltas = {};
    const strengths = [];
    const gaps = [];
    
    questions.forEach(q => {
      if (!q.evaluation) return;
      
      const baseDelta = {
        'understood': 5,
        'partial': 0,
        'misunderstood': -8
      }[q.evaluation] || 0;
      
      const weighted = baseDelta * (q.confidence || 0.5);
      q.conceptTags.forEach(tag => {
        deltas[tag] = (deltas[tag] || 0) + weighted;
      });
      
      if (q.evaluation === 'understood') {
        strengths.push(...q.expectedConcepts.filter(c => !strengths.includes(c)));
      } else if (q.evaluation === 'misunderstood' || (q.evaluation === 'partial' && (q.confidence || 0) < 0.4)) {
        gaps.push(...q.expectedConcepts.filter(c => !gaps.includes(c)));
      }
    });
    
    totalDelta = session.skippedQuestionIds.length * (settings?.skipPenalty || -3);
    if (session.forceExited) {
      totalDelta += settings?.forceExitPenalty || -8;
    }
    Object.values(deltas).forEach(d => totalDelta += d);
    
    const topicProgress = getTopicProgress(session.studentId, session.topic);
    const newMastery = Math.max(0, Math.min(100, topicProgress.masteryScore + totalDelta));
    
    updateTopicProgress(session.studentId, session.topic, {
      masteryScore: Math.round(newMastery),
      lastDefenderSession: new Date().toISOString(),
      defenderPassCount: topicProgress.defenderPassCount + (gaps.length === 0 ? 1 : 0),
      defenderFailCount: topicProgress.defenderFailCount + (gaps.length > 0 ? 1 : 0),
      skipCount: topicProgress.skipCount + session.skippedQuestionIds.length,
      forceExitCount: topicProgress.forceExitCount + (session.forceExited ? 1 : 0)
    });
    
    const studentMastery = getTopicProgress(session.studentId, session.topic).masteryScore;
    const recommendedVideos = getVideoLessons({ 
      topic: session.domain, 
      concept: session.topic,
      difficulty: studentMastery < 60 ? 'basic' : 'intermediate'
    }).slice(0, 3);
    
    const recommendedProblems = gaps.length > 0
      ? getProblemsForRemediation(gaps, studentMastery)
      : getProblemsForEnrichment(strengths, studentMastery);
    
    let outcome = 'inconclusive';
    let badge = null;
    if (gaps.length === 0 && questions.length >= 3) {
      outcome = 'deep-understanding';
      badge = 'deep-understanding';
    } else if (gaps.length > 0) {
      outcome = 'gaps-found';
      badge = 'needs-practice';
    }
    
    const report = {
      outcome,
      masteryDelta: deltas,
      strengths: strengths.slice(0, 5),
      gaps: gaps.slice(0, 5),
      recommendedVideos,
      recommendedProblems,
      nextSteps: gaps.length > 0 
        ? ['Watch recommended videos', 'Practice basic problems for identified gaps', 'Retake defender in 1 week']
        : ['Excellent mastery demonstrated', 'Try advanced problems for enrichment', 'Explore related advanced topics'],
      badge,
      summary: gaps.length === 0 
        ? `Excellent! You demonstrated deep understanding of ${session.topic}.`
        : `Some gaps identified in ${session.topic}. Recommended: ${gaps.slice(0, 2).join(', ')}.`
    };
    
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    session.duration = Math.floor((new Date(session.completedAt) - new Date(session.startedAt)) / 1000);
    
    const sessionsData = readJSON('defenderSessions.json');
    sessionsData[sessionId] = session;
    writeJSON('defenderSessions.json', sessionsData);
    
    const masteryRecords = readJSON('masteryRecords.json');
    if (!masteryRecords[session.studentId]) masteryRecords[session.studentId] = {};
    Object.entries(deltas).forEach(([topic, delta]) => {
      const current = masteryRecords[session.studentId][topic] || 50;
      masteryRecords[session.studentId][topic] = Math.max(0, Math.min(100, Math.round(current + delta)));
    });
    writeJSON('masteryRecords.json', masteryRecords);
    
    res.json({ report, masteryDelta: deltas, session });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/skip-question', async (req, res) => {
  try {
    const { sessionId, questionId } = req.body;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const settings = getInstituteSettings(session.studentId);
    const question = session.questions.find(q => q.id === questionId);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    session.skippedQuestionIds.push(questionId);
    
    const questionIndex = session.questions.length;
    const previousLevel = session.questions.length > 0 ? session.questions[session.questions.length - 1].level : 'easy';
    const nextLevel = getNextLevel(previousLevel, 'partial', questionIndex);
    
    const nextQuestion = generateMockQuestion(session.topic, session.domain, nextLevel, previousLevel, questionIndex);
    
    const isFinal = !shouldContinue([
      ...session.questions,
      { ...nextQuestion, confidence: 0.5 }
    ], settings);
    
    session.lastActiveAt = new Date().toISOString();
    sessions[sessionId] = session;
    writeJSON('defenderSessions.json', sessions);
    
    res.json({
      nextQuestion,
      penaltyApplied: settings?.skipPenalty || -3,
      isFinal
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.post('/force-exit', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.forceExited = true;
    session.status = 'force-exited';
    
    const settings = getInstituteSettings(session.studentId);
    const topicProgressData = getTopicProgress(session.studentId, session.topic);
    
    updateTopicProgress(session.studentId, session.topic, {
      forceExitCount: topicProgressData.forceExitCount + 1,
      skipCount: topicProgressData.skipCount + session.skippedQuestionIds.length
    });
    
    const masteryRecords = readJSON('masteryRecords.json');
    if (!masteryRecords[session.studentId]) masteryRecords[session.studentId] = {};
    
    const totalPenalty = session.skippedQuestionIds.length * (settings?.skipPenalty || -3) + (settings?.forceExitPenalty || -8);
    masteryRecords[session.studentId][session.topic] = Math.max(0, Math.min(100, (masteryRecords[session.studentId][session.topic] || 50) + totalPenalty));
    writeJSON('masteryRecords.json', masteryRecords);
    
    const settingsData = getInstituteSettings(session.studentId);
    const studentMastery = getTopicProgress(session.studentId, session.topic).masteryScore;
    const recommendedVideos = getVideoLessons({ topic: session.domain, concept: session.topic, difficulty: studentMastery < 60 ? 'basic' : 'intermediate' }).slice(0, 3);
    const recommendedProblems = getProblemsForRemediation(['incomplete session'], studentMastery);
    
    const report = {
      outcome: 'inconclusive',
      masteryDelta: { [session.topic]: totalPenalty },
      strengths: [],
      gaps: ['Session incomplete - force exited'],
      recommendedVideos,
      recommendedProblems,
      nextSteps: ['Complete the defender session', 'Review recommended materials', 'Try again when ready'],
      badge: null,
      summary: 'Session ended early. Mastery penalty applied.'
    };
    
    session.completedAt = new Date().toISOString();
    session.duration = Math.floor((new Date(session.completedAt) - new Date(session.startedAt)) / 1000);
    sessions[sessionId] = session;
    writeJSON('defenderSessions.json', sessions);
    
    res.json({ report, penaltyApplied: totalPenalty, session });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get('/resume/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session not active' });
    }
    
    const currentQuestionIndex = session.questions.length;
    
    res.json({ session, currentQuestionIndex });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get('/report/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessions = readJSON('defenderSessions.json');
    const session = sessions[sessionId];
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ session, report: session.report || null });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get('/video-lessons', async (req, res) => {
  try {
    const { topic, domain, concept, difficulty } = req.query;
    const videos = getVideoLessons({ topic, domain, concept, difficulty });
    res.json({ videos });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

module.exports = router;