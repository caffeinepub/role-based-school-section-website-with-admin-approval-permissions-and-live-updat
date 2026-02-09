import { useGetAnnouncements, useGetHomework, useGetRoutines, useGetClassTimes } from '../../hooks/useQueries';

export interface AssistantContextData {
  latestNotices?: string;
  homeworkSummary?: string;
  todayRoutine?: string;
  scheduleSummary?: string;
  isLoading: boolean;
}

export function useAssistantContextData(): AssistantContextData {
  const { data: announcements, isLoading: noticesLoading } = useGetAnnouncements();
  const { data: homework, isLoading: homeworkLoading } = useGetHomework();
  const { data: routines, isLoading: routinesLoading } = useGetRoutines();
  const { data: classTimes, isLoading: scheduleLoading } = useGetClassTimes();
  
  const isLoading = noticesLoading || homeworkLoading || routinesLoading || scheduleLoading;
  
  // Latest notices (top 3)
  const latestNotices = announcements && announcements.length > 0
    ? announcements
        .slice(0, 3)
        .map(n => `• ${n.title}`)
        .join('\n')
    : undefined;
  
  // Homework summary (top 3)
  const homeworkSummary = homework && homework.length > 0
    ? homework
        .slice(0, 3)
        .map(h => `• ${h.subject}: ${h.title} (Due: ${h.dueDate})`)
        .join('\n')
    : undefined;
  
  // Today's routine
  const todayRoutine = routines && routines.length > 0
    ? (() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const latestRoutine = routines[0];
        const todaySchedule = latestRoutine.routines.find(r => r.dayName === today);
        
        if (todaySchedule && todaySchedule.periods.length > 0) {
          return todaySchedule.periods
            .slice(0, 3)
            .map(p => `• Period ${p.periodNumber}: ${p.subject} (${p.startTime} - ${p.endTime})`)
            .join('\n');
        }
        return 'No classes scheduled for today.';
      })()
    : undefined;
  
  // Schedule summary (next 3 classes)
  const scheduleSummary = classTimes && classTimes.length > 0
    ? classTimes
        .slice(0, 3)
        .map(c => `• ${c.weekDay}: ${c.subject} (${c.startTime} - ${c.endTime})`)
        .join('\n')
    : undefined;
  
  return {
    latestNotices,
    homeworkSummary,
    todayRoutine,
    scheduleSummary,
    isLoading
  };
}
