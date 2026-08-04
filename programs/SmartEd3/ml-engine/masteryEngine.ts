export interface MasterySnapshot {
  [key: string]: number;
}

const defaults = {
  prior: 0.3,
  transition: 0.15,
  slip: 0.1,
  guess: 0.2,
};

export function updateMasteryScore(current: number, answerCorrect: boolean): number {
  const prior = current / 100;
  const evidence = answerCorrect
    ? (prior * (1 - defaults.slip)) / (prior * (1 - defaults.slip) + (1 - prior) * defaults.guess)
    : (prior * defaults.slip) / (prior * defaults.slip + (1 - prior) * (1 - defaults.guess));
  const next = evidence + (1 - evidence) * defaults.transition;
  return Math.round(next * 100);
}
