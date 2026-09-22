import { useToggleVote } from "@/lib/votes";

type Props = {
  suggestionId: string;
  count: number;
  hasVoted: boolean;
  size?: "sm" | "lg";
};

export function VoteButton({ suggestionId, count, hasVoted, size = "sm" }: Props) {
  const toggle = useToggleVote();

  return (
    <button
      type="button"
      aria-label={hasVoted ? "Ta tillbaka din röst" : "Rösta på förslaget"}
      aria-pressed={hasVoted}
      disabled={toggle.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate({ suggestionId, hasVoted });
      }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium transition-colors disabled:opacity-60 ${
        size === "lg" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"
      } ${
        hasVoted
          ? "bg-moss text-primary-foreground hover:bg-moss-light"
          : "bg-moss-pale text-moss ring-1 ring-moss/20 hover:bg-moss/15"
      }`}
    >
      <span aria-hidden="true">▲</span>
      <span>{count}</span>
      <span className="sr-only">röster</span>
      <span className={size === "lg" ? "" : "hidden sm:inline"}>
        {hasVoted ? "Röstat" : "Rösta"}
      </span>
    </button>
  );
}
