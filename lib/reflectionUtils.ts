export const emotionLabels: Record<string, string> = {
  'OVERWHELMED': 'Being overwhelmed',
  'MISSING_SOMEONE': 'Missing Someone',
  'STRESS': 'Stress',
  'LONELINESS': 'Loneliness',
  'RELATIONSHIP_ISSUES': 'Relationship Issues',
  'SADNESS': 'Sadness',
  'JOY': 'Joy',
  'PROUD': 'Pride',
  'NO_REASON': 'No Specific Reason'
};

export const getIntensityDescription = (intensity: number): string => {
  if (intensity <= 2) return "Very mild";
  if (intensity <= 4) return "Mild";
  if (intensity <= 6) return "Moderate";
  if (intensity <= 8) return "Strong";
  return "Very intense";
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
