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
};

export const CATEGORIES = [
  "Administration",
  "IT",
  "Arbetsmiljö",
  "Kommunikation",
  "Ekonomi",
  "Övrigt",
] as const;

export const STATUS_STYLES: Record<string, string> = {
  Ny: "bg-sand-dark text-ink-soft",
  Pågår: "bg-rose-pale text-rose",
  Klar: "bg-moss-pale text-moss",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
}
