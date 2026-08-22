export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type EvaluationResult = 'understood' | 'partial' | 'misunderstood';
export type TriggerType = 'auto' | 'manual';
export type SessionMode = 'enrichment' | 'remediation';
export type SessionStatus = 'active' | 'completed' | 'force-exited';

export interface SocraticSession {
  id: string;
  studentId: string;
  topic: string;
  domain: string;
  triggerType: TriggerType;
  mode: SessionMode;
  status: SessionStatus;
  questions: QuestionResult[];
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
  skippedQuestionIds: string[];
  forceExited: boolean;
}

export interface QuestionResult {
  id: string;
  level: DifficultyLevel;
  question: string;
  expectedConcepts: string[];
  studentResponse?: string;
  evaluation?: EvaluationResult;
  confidence?: number;
  timeSpent?: number;
  conceptTags: string[];
  toughnessRating?: number;
}

export interface DefenderReport {
  outcome: 'deep-understanding' | 'gaps-found' | 'inconclusive';
  masteryDelta: Record<string, number>;
  strengths: string[];
  gaps: string[];
  recommendedVideos: VideoLesson[];
  recommendedProblems: RecommendedProblem[];
  nextSteps: string[];
  badge?: 'deep-understanding' | 'needs-practice';
  summary: string;
}

export interface VideoLesson {
  id: string;
  topic: string;
  domain: string;
  concept: string;
  title: string;
  youtubeUrl: string;
  duration: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  tags: string[];
  source: string;
}

export interface RecommendedProblem {
  id: string;
  title: string;
  conceptTags: string[];
  seedTier: string;
  liveToughnessRating: number;
  remediationLevel?: 'basic' | 'intermediate' | 'advanced';
  enrichmentLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  isRemediation: boolean;
}

export interface DefenderSettings {
  masteryThreshold: number;
  confidenceThreshold: number;
  maxQuestions: number;
  minQuestions: number;
  skipPenalty: number;
  forceExitPenalty: number;
  timerEnabled: boolean;
  timerBase: number;
  enrichmentMode: boolean;
}

export interface TopicProgress {
  totalSolved: number;
  masteryScore: number;
  lastDefenderSession?: string;
  defenderPassCount: number;
  defenderFailCount: number;
  skipCount: number;
  forceExitCount: number;
}

export interface StudentTopicProgress {
  [topic: string]: TopicProgress;
}

export interface AllTopicProgress {
  [studentId: string]: StudentTopicProgress;
}

export interface DefenderSessionRecord {
  id: string;
  studentId: string;
  topic: string;
  domain: string;
  triggerType: TriggerType;
  mode: SessionMode;
  triggerReason: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  questions: QuestionResult[];
  skipped: string[];
  forceExited: boolean;
  report?: DefenderReport;
}

export interface CheckTriggerRequest {
  studentId: string;
  topic: string;
}

export interface CheckTriggerResponse {
  shouldTrigger: boolean;
  reason: string;
  sessionId?: string;
  mode?: SessionMode;
  currentMastery?: number;
  threshold?: number;
}

export interface StartSessionRequest {
  studentId: string;
  topic: string;
  triggerType: TriggerType;
  selectedTopics?: string[];
}

export interface StartSessionResponse {
  sessionId: string;
  firstQuestion: QuestionResult;
  estimatedTime: number;
}

export interface NextQuestionRequest {
  sessionId: string;
  previousResponse?: string;
  confidence?: number;
}

export interface NextQuestionResponse {
  question: QuestionResult;
  isFinal: boolean;
  questionIndex: number;
  totalEstimated: number;
}

export interface EvaluateResponseRequest {
  sessionId: string;
  questionId: string;
  studentResponse: string;
}

export interface EvaluateResponseResponse {
  evaluation: EvaluationResult;
  confidence: number;
  feedback: string;
  expectedConcepts: string[];
}

export interface CompleteSessionResponse {
  report: DefenderReport;
  masteryDelta: Record<string, number>;
  session: DefenderSessionRecord;
}

export interface SkipQuestionRequest {
  sessionId: string;
  questionId: string;
}

export interface SkipQuestionResponse {
  nextQuestion: QuestionResult;
  penaltyApplied: number;
  isFinal: boolean;
}

export interface ForceExitRequest {
  sessionId: string;
}

export interface ForceExitResponse {
  report: DefenderReport;
  penaltyApplied: number;
  session: DefenderSessionRecord;
}

export interface ResumeSessionResponse {
  session: SocraticSession;
  currentQuestionIndex: number;
}

export interface VideoLessonQuery {
  topic?: string;
  domain?: string;
  concept?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
}

export interface VideoLessonResponse {
  videos: VideoLesson[];
}