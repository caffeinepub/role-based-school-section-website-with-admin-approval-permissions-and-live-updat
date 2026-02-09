import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { StudentApplication, Announcement, Homework, ClassRoutine, RoutineDay, ClassTime, Student, StudentLoginStatus } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { isCanisterStoppedError } from '../utils/adminErrors';

// Helper to determine refetch interval based on error state
function getRefetchInterval(error: unknown): number | false {
  // If there's a canister-stopped error, stop polling
  if (error && isCanisterStoppedError(error)) {
    return false;
  }
  // Otherwise, poll every 5 seconds
  return 5000;
}

// Student Applications
export function useGetAllApplications(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  const query = useQuery<StudentApplication[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    refetchInterval: (query) => getRefetchInterval(query.state.error),
  });

  return query;
}

export function useSubmitApplication() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (application: StudentApplication) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitApplication(application);
    },
  });
}

export function useApproveApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      // Generate a random principal for the student
      const randomBytes = new Uint8Array(29);
      crypto.getRandomValues(randomBytes);
      const studentPrincipal = Principal.fromUint8Array(randomBytes);
      return actor.approveStudentApplication(username, studentPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['approvedStudents'] });
    },
  });
}

export function useRejectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectStudentApplication(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// Student Login
export function useStudentLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.tryStudentLogin(username, password);
    },
  });
}

// Approved Students
export function useGetApprovedStudents(options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();

  const query = useQuery<Student[]>({
    queryKey: ['approvedStudents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentsList();
    },
    enabled: options?.enabled !== false && !!actor && !isFetching,
    refetchInterval: (query) => getRefetchInterval(query.state.error),
  });

  return query;
}

export function usePromoteToEditor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteToEditor(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedStudents'] });
    },
  });
}

export function useDemoteToStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.demoteToStudent(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedStudents'] });
    },
  });
}

// Announcements
export function useGetAnnouncements() {
  const { actor, isFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAddAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAnnouncement(title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, content }: { id: bigint; title: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAnnouncement(id, title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// Homework
export function useGetHomework() {
  const { actor, isFetching } = useActor();

  return useQuery<Homework[]>({
    queryKey: ['homework'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHomeworks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAddHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, dueDate, subject, teacher }: { title: string; content: string; dueDate: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomework(title, content, dueDate, subject, teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });
}

export function useUpdateHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, content, dueDate, subject, teacher }: { id: bigint; title: string; content: string; dueDate: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomework(id, title, content, dueDate, subject, teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });
}

export function useDeleteHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHomework(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });
}

// Class Routines
export function useGetRoutines() {
  const { actor, isFetching } = useActor();

  return useQuery<ClassRoutine[]>({
    queryKey: ['routines'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoutines();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAddRoutine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routine: RoutineDay[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClassRoutine(routine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

export function useUpdateRoutine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, routine }: { id: bigint; routine: RoutineDay[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClassRoutine(id, routine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

export function useDeleteRoutine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClassRoutine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

// Class Times
export function useGetClassTimes() {
  const { actor, isFetching } = useActor();

  return useQuery<ClassTime[]>({
    queryKey: ['classTimes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClassTimes();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAddClassTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ weekDay, startTime, endTime, subject, teacher }: { weekDay: string; startTime: string; endTime: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClassTime(weekDay, startTime, endTime, subject, teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTimes'] });
    },
  });
}

export function useUpdateClassTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, weekDay, startTime, endTime, subject, teacher }: { id: bigint; weekDay: string; startTime: string; endTime: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClassTime(id, weekDay, startTime, endTime, subject, teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTimes'] });
    },
  });
}

export function useDeleteClassTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClassTime(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTimes'] });
    },
  });
}
