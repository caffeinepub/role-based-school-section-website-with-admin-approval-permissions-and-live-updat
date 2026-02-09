import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Lock state queries
export function useGetMasterLock() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['locks', 'master'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isContentLocked('notices', null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

export function useGetSectionLock(section: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['locks', 'section', section],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isContentLocked(section, null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

export function useGetItemLock(section: string, itemId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['locks', 'item', section, itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) return false;
      return actor.isContentLocked(section, itemId);
    },
    enabled: !!actor && !isFetching && itemId !== null,
    refetchInterval: 5000
  });
}

// Lock mutations
export function useSetMasterLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (state: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setMasterLock(state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks'] });
    }
  });
}

export function useSetSectionLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, state }: { section: string; state: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setSectionLock(section, state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks'] });
    }
  });
}

export function useSetItemLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, itemId, state }: { section: string; itemId: bigint; state: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setItemLock(section, itemId, state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locks'] });
    }
  });
}
