import { guidanceContent, exampleQuestions, type UserRole } from './assistantContent';

export interface AssistantResponse {
  text: string;
  suggestions?: string[];
  action?: {
    label: string;
    path: string;
  };
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function matchesKeywords(userInput: string, keywords: string[]): boolean {
  const normalized = normalizeText(userInput);
  return keywords.some(keyword => normalized.includes(normalizeText(keyword)));
}

export function generateResponse(
  userInput: string,
  userRole: UserRole,
  contextData?: {
    latestNotices?: string;
    homeworkSummary?: string;
    todayRoutine?: string;
    scheduleSummary?: string;
  }
): AssistantResponse {
  const normalized = normalizeText(userInput);
  
  // Check for context-based queries
  if (normalized.includes('latest notice') || normalized.includes('recent notice')) {
    if (contextData?.latestNotices) {
      return {
        text: `Here are the latest notices:\n\n${contextData.latestNotices}`,
        action: { label: 'Open Notices Page', path: '/notices' }
      };
    } else {
      return {
        text: 'I cannot load the latest notices right now. Please try again in a moment or visit the Notices page directly.',
        action: { label: 'Open Notices Page', path: '/notices' }
      };
    }
  }
  
  if (normalized.includes('homework') && (normalized.includes('what') || normalized.includes('show') || normalized.includes('list'))) {
    if (contextData?.homeworkSummary) {
      return {
        text: `Here's your homework:\n\n${contextData.homeworkSummary}`,
        action: { label: 'Open Homework Page', path: '/homework' }
      };
    } else {
      return {
        text: 'I cannot load homework right now. Please try again in a moment or visit the Homework page directly.',
        action: { label: 'Open Homework Page', path: '/homework' }
      };
    }
  }
  
  if (normalized.includes('today') && (normalized.includes('routine') || normalized.includes('schedule') || normalized.includes('class'))) {
    if (contextData?.todayRoutine) {
      return {
        text: `Today's routine:\n\n${contextData.todayRoutine}`,
        action: { label: 'Open Class Routine', path: '/routine' }
      };
    } else {
      return {
        text: 'I cannot load today\'s routine right now. Please try again in a moment or visit the Class Routine page directly.',
        action: { label: 'Open Class Routine', path: '/routine' }
      };
    }
  }
  
  if (normalized.includes('class') && (normalized.includes('time') || normalized.includes('schedule') || normalized.includes('when'))) {
    if (contextData?.scheduleSummary) {
      return {
        text: `Class schedule:\n\n${contextData.scheduleSummary}`,
        action: { label: 'Open Class Schedule', path: '/schedule' }
      };
    } else {
      return {
        text: 'I cannot load the class schedule right now. Please try again in a moment or visit the Class Schedule page directly.',
        action: { label: 'Open Class Schedule', path: '/schedule' }
      };
    }
  }
  
  // Check for intent matches
  for (const content of guidanceContent) {
    if (matchesKeywords(userInput, content.keywords)) {
      // Check role permission
      if (content.role && !content.role.includes(userRole)) {
        return {
          text: 'You need admin access to do that. This feature is only available to administrators.',
          suggestions: exampleQuestions[userRole]
        };
      }
      
      return {
        text: content.response
      };
    }
  }
  
  // Fallback response with example questions
  return {
    text: 'I\'m not sure I understand. Here are some things you can ask me:',
    suggestions: exampleQuestions[userRole]
  };
}
