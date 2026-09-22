import { useToggleVote } from "@/lib/votes";
import { Button } from "@/components/ui/button";

type Props = {
  suggestionId: string;
  count: number;
  hasVoted: boolean;
  size?: "sm" | "lg";
};

export function VoteButton({ suggestionId, count, hasVoted, size = "sm" }: Props) {
  const toggle = useToggleVote();

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size={size === "lg" ? "default" : "sm"}
      type="button"
      aria-label={hasVoted ? "Ta tillbaka din röst" : "Rösta på förslaget"}
      aria-pressed={hasVoted}
      disabled={toggle.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate({ suggestionId, hasVoted });
      }}
      className="shrink-0"
    >
      <span aria-hidden="true">▲</span>
      <span>{count}</span>
      <span className="sr-only">röster</span>
      <span className={size === "lg" ? "" : "hidden sm:inline"}>
        {hasVoted ? "Röstat" : "Rösta"}
      </span>
    </Button>
  );
}
