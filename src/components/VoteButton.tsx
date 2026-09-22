import { ChevronUp } from "lucide-react";
import { useToggleVote } from "@/lib/votes";
import { Button } from "@/components/ui/button";

type Props = {
  suggestionId: string;
  count: number;
  hasVoted: boolean;
  size?: "sm" | "lg";
  title?: string;
};

export function VoteButton({ suggestionId, count, hasVoted, size = "sm", title }: Props) {
  const toggle = useToggleVote();
  const suffix = title ? ` på förslaget ${title}` : " på förslaget";

  return (
    <Button
      variant={hasVoted ? "default" : "outline"}
      size={size === "lg" ? "default" : "sm"}
      type="button"
      aria-label={
        hasVoted
          ? `Ta tillbaka din röst${suffix}. ${count} röster.`
          : `Rösta${suffix}. ${count} röster.`
      }
      aria-pressed={hasVoted}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ suggestionId, hasVoted })}
      className="shrink-0"
    >
      <ChevronUp aria-hidden="true" className="size-4" />
      <span aria-hidden="true">{count}</span>
      <span aria-hidden="true" className={size === "lg" ? "" : "hidden sm:inline"}>
        {hasVoted ? "Röstat" : "Rösta"}
      </span>
    </Button>
  );
}
