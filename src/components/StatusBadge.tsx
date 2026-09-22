import { CalendarClock, CheckCircle2, CircleDot, Search, XCircle } from "lucide-react";
import { STATUS_STYLES } from "@/lib/suggestions";

const ICONS: Record<string, typeof CircleDot> = {
  Nytt: CircleDot,
  "Under bedömning": Search,
  Planerat: CalendarClock,
  "Genomfört": CheckCircle2,
  Avslutat: XCircle,
};

export function StatusBadge({ status }: { status: string }) {
  const Icon = ICONS[status] ?? CircleDot;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-current/25 px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ?? STATUS_STYLES["Nytt"]
      }`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      <span className="sr-only">Status: </span>
      {status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
      <span className="sr-only">Verksamhetsområde: </span>
      {category}
    </span>
  );
}
