import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { 
  StudentApplication, 
  Announcement, 
  Homework, 
  ClassRoutine, 
  ClassTime,
  RoutineDay,
  StudentLoginStatus,
  Student
} from '../backend';

// Student Login
export function useStudentLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.tryStudentLogin(username, password);
    }
  });
}

// Student Applications
export function useSubmitApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (app: StudentApplication) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitApplication(app);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
}

export function useGetAllApplications() {
  const { actor, isFetching } = useActor();

  return useQuery<StudentApplication[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

export function useApproveApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      // Generate a deterministic principal from the username
      // This creates a unique principal for each username
      const textEncoder = new TextEncoder();
      const usernameBytes = textEncoder.encode(username);
      const principal = Principal.fromUint8Array(usernameBytes);
      return actor.approveStudentApplication(username, principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['approvedStudents'] });
    }
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
    }
  });
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
    }
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
    }
  });
}

// Approved Students List
export function useGetApprovedStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['approvedStudents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudentsList();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
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
    refetchInterval: 5000
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
    }
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
    }
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
    }
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
    refetchInterval: 5000
  });
}

export function useAddHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; content: string; dueDate: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomework(data.title, data.content, data.dueDate, data.subject, data.teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    }
  });
}

export function useUpdateHomework() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; title: string; content: string; dueDate: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomework(data.id, data.title, data.content, data.dueDate, data.subject, data.teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    }
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
    }
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
    refetchInterval: 5000
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
    }
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
    }
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
    }
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
    refetchInterval: 5000
  });
}

export function useAddClassTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { weekDay: string; startTime: string; endTime: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClassTime(data.weekDay, data.startTime, data.endTime, data.subject, data.teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTimes'] });
    }
  });
}

export function useUpdateClassTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; weekDay: string; startTime: string; endTime: string; subject: string; teacher: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClassTime(data.id, data.weekDay, data.startTime, data.endTime, data.subject, data.teacher);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classTimes'] });
    }
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
    }
  });
}
