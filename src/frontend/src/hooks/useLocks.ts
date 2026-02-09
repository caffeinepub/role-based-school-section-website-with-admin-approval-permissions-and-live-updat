import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SectionLocks } from '../backend';

// Master lock query - returns only master lock state
export function useGetMasterLock() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['locks', 'master'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isMasterLocked();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

// Section locks query - returns all section locks
export function useGetSectionLocks() {
  const { actor, isFetching } = useActor();

  return useQuery<SectionLocks>({
    queryKey: ['locks', 'sections'],
    queryFn: async () => {
      if (!actor) return { notices: false, homework: false, routine: false, classTime: false };
      return actor.getSectionLocks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

// Individual section lock query - extracts specific section from section locks
export function useGetSectionLock(section: 'notices' | 'homework' | 'routine' | 'classTime') {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['locks', 'section', section],
    queryFn: async () => {
      if (!actor) return false;
      const locks = await actor.getSectionLocks();
      return locks[section];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

// Item locks query - returns all item locks for a section
export function useGetItemLocksBySection(section: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, boolean]>>({
    queryKey: ['locks', 'items', section],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItemLocksBySection(section);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000
  });
}

// Individual item lock query - checks if specific item is locked
export function useGetItemLock(section: string, itemId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['locks', 'item', section, itemId?.toString()],
    queryFn: async () => {
      if (!actor || itemId === null) return false;
      const itemLocks = await actor.getItemLocksBySection(section);
      const lockEntry = itemLocks.find(([id]) => id === itemId);
      return lockEntry ? lockEntry[1] : false;
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
    onSuccess: (_, state) => {
      // Optimistically update master lock
      queryClient.setQueryData(['locks', 'master'], state);
      // Invalidate all lock queries to refetch
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
    onSuccess: (_, { section, state }) => {
      // Optimistically update section lock
      queryClient.setQueryData(['locks', 'section', section], state);
      // Invalidate section locks to refetch all
      queryClient.invalidateQueries({ queryKey: ['locks', 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['locks', 'section'] });
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
    onSuccess: (_, { section, itemId, state }) => {
      // Optimistically update item lock
      queryClient.setQueryData(['locks', 'item', section, itemId.toString()], state);
      // Invalidate item locks for this section
      queryClient.invalidateQueries({ queryKey: ['locks', 'items', section] });
      queryClient.invalidateQueries({ queryKey: ['locks', 'item', section] });
    }
  });
}
