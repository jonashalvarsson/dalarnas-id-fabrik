import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "forbattringsposten_voter_key";

export function getVoterKey(): string {
  if (typeof window === "undefined") return "";
  let key = window.localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

export type VoteData = {
  counts: Record<string, number>;
  mine: Set<string>;
};

export function useVotes() {
  return useQuery<VoteData>({
    queryKey: ["votes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestion_votes")
        .select("suggestion_id, voter_key");
      if (error) throw error;

      const voterKey = getVoterKey();
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      for (const row of data ?? []) {
        counts[row.suggestion_id] = (counts[row.suggestion_id] ?? 0) + 1;
        if (row.voter_key === voterKey) mine.add(row.suggestion_id);
      }
      return { counts, mine };
    },
  });
}

export function useToggleVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ suggestionId, hasVoted }: { suggestionId: string; hasVoted: boolean }) => {
      const voterKey = getVoterKey();
      if (hasVoted) {
        const { error } = await supabase
          .from("suggestion_votes")
          .delete()
          .eq("suggestion_id", suggestionId)
          .eq("voter_key", voterKey);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("suggestion_votes")
          .insert({ suggestion_id: suggestionId, voter_key: voterKey });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes"] });
    },
  });
}
