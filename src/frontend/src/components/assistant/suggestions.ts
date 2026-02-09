// Suggestion engine for "Did you mean?" functionality
interface Suggestion {
  intent: string;
  text: string;
  confidence: number;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(/\s+/).filter(Boolean);
}

function calculateOverlap(userTokens: string[], keywords: string[]): number {
  const keywordTokens = keywords.flatMap(k => tokenize(k));
  const matches = userTokens.filter(token => 
    keywordTokens.some(kw => kw.includes(token) || token.includes(kw))
  );
  return matches.length / Math.max(userTokens.length, 1);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function calculateTypoTolerance(userText: string, keywords: string[]): number {
  const userNorm = normalizeText(userText);
  let bestScore = 0;
  
  for (const keyword of keywords) {
    const kwNorm = normalizeText(keyword);
    const distance = levenshteinDistance(userNorm, kwNorm);
    const maxLen = Math.max(userNorm.length, kwNorm.length);
    const similarity = 1 - (distance / maxLen);
    bestScore = Math.max(bestScore, similarity);
  }
  
  return bestScore;
}

export function getSuggestions(
  userInput: string,
  availableIntents: Array<{ intent: string; keywords: string[]; question: string }>
): Suggestion[] {
  const userTokens = tokenize(userInput);
  const suggestions: Suggestion[] = [];
  
  for (const item of availableIntents) {
    const overlapScore = calculateOverlap(userTokens, item.keywords);
    const typoScore = calculateTypoTolerance(userInput, item.keywords);
    const confidence = Math.max(overlapScore, typoScore);
    
    // Only suggest if confidence is between 0.3 and 0.7
    // (too low = not relevant, too high = already matched)
    if (confidence >= 0.3 && confidence < 0.7) {
      suggestions.push({
        intent: item.intent,
        text: item.question,
        confidence
      });
    }
  }
  
  // Sort by confidence and return top 3
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}
