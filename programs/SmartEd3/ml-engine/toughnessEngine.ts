export function getToughnessLabel(rating: number): string {
  if (rating < 1200) return 'Easy';
  if (rating <= 1600) return 'Medium';
  return 'Hard';
}

export function updateToughnessRatings(
  studentRating: number,
  problemRating: number,
  solved: boolean,
): { studentRating: number; problemRating: number } {
  const expected = 1 / (1 + Math.pow(10, (problemRating - studentRating) / 400));
  const outcome = solved ? 1 : 0;

  const newStudentRating = studentRating + 24 * (outcome - expected);
  const newProblemRating = problemRating + 8 * ((1 - outcome) - (1 - expected));

  return { studentRating: Math.round(newStudentRating), problemRating: Math.round(newProblemRating) };
}
