export type Suggestion = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  author_name: string | null;
  created_at: string;
  problem: string;
  expected_benefit: string;
  admin_comment: string;
  status_updated_at: string | null;
  is_prioritized: boolean;
  responsible_person: string;
};

export const CATEGORIES = [
  "Administration",
  "IT",
  "Arbetsmiljö",
  "Kommunikation",
  "Ekonomi",
  "Övrigt",
] as const;

export const STATUSES = [
  "Nytt",
  "Under bedömning",
  "Planerat",
  "Genomfört",
  "Avslutat",
] as const;

export const STATUS_STYLES: Record<string, string> = {
  Nytt: "bg-sand-dark text-ink-soft",
  "Under bedömning": "bg-sky-pale text-sky",
  Planerat: "bg-amber-pale text-amber",
  "Genomfört": "bg-moss-pale text-moss",
  Avslutat: "bg-ash-pale text-ash",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}
