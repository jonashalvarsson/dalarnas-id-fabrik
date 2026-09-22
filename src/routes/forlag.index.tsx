import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, STATUSES, formatDate, type Suggestion } from "@/lib/suggestions";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { useVotes } from "@/lib/votes";
import { VoteButton } from "@/components/VoteButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forlag/")({
  head: () => ({
    meta: [
      { title: "Alla förslag – Förbättringsposten" },
      {
        name: "description",
        content: "Se alla inskickade förbättringsförslag till Region Dalarna med kategori, datum och status.",
      },
      { property: "og:title", content: "Alla förslag – Förbättringsposten" },
      {
        property: "og:description",
        content: "Se alla inskickade förbättringsförslag till Region Dalarna med kategori, datum och status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForlagPage,
});

function ForlagPage() {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Suggestion[];
    },
  });

  const { data: votes } = useVotes();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"votes" | "date">("votes");

  const filtered = suggestions
    ?.filter((s) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      const matchesCategory = category === "" || s.category === category;
      const matchesStatus = status === "" || s.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    })
    .sort((a, b) =>
      sort === "votes" ? (votes?.counts[b.id] ?? 0) - (votes?.counts[a.id] ?? 0) : 0,
    );

  const selectClasses =
    "mt-2 min-h-12 w-full rounded-md border border-input bg-card px-4 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <>
      <div className="pb-6">
        <h1 className="text-3xl font-bold text-ink">Alla förslag</h1>
        <p className="mt-2 text-base text-ink-soft">Här kan du läsa och rösta på medarbetarnas förslag.</p>
      </div>

      <div className="mb-8 grid gap-4 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="suggestion-search">Sök förslag</Label>
          <Input
            id="suggestion-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök bland förslag…"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="category-filter">Verksamhetsområde</Label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClasses}
          >
            <option value="">Alla områden</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status-filter">Status</Label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={selectClasses}
          >
            <option value="">Alla statusar</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="sort-filter">Sortering</Label>
          <select
            id="sort-filter"
            value={sort}
            onChange={(e) => setSort(e.target.value as "votes" | "date")}
            className={selectClasses}
          >
            <option value="votes">Flest röster</option>
            <option value="date">Senaste först</option>
          </select>
        </div>
      </div>

      <p aria-live="polite" className="mb-4 text-sm font-semibold text-ink-soft">
        {filtered ? `${filtered.length} förslag visas` : "Hämtar förslag…"}
      </p>

      <div className="space-y-4 pb-12">
        {isLoading &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-md bg-card ring-1 ring-border" />
          ))}

        {!isLoading && suggestions?.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-semibold text-ink">Inga förslag ännu</p>
            <p className="mt-1 text-sm text-ink-soft">Bli den första att lämna ett förslag.</p>
            <Link
              to="/"
              className="mt-4 inline-flex min-h-12 items-center rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Lämna ett förslag
            </Link>
          </div>
        )}

        {!isLoading && suggestions && suggestions.length > 0 && filtered?.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
            <p className="text-base font-semibold text-ink">Inga träffar</p>
            <p className="mt-1 text-sm text-ink-soft">Prova att ändra sökordet eller filtren.</p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <ul className="space-y-4">
            {filtered.map((s) => (
              <li
                key={s.id}
                className="rounded-md border border-border border-l-4 border-l-primary bg-card p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start gap-2">
                  <CategoryBadge category={s.category} />
                  <StatusBadge status={s.status} />
                </div>
                <h2 className="mt-3 text-lg font-semibold leading-snug text-ink">
                  <Link
                    to="/forlag/$id"
                    params={{ id: s.id }}
                    className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-2 text-base leading-relaxed text-ink-soft">{s.description}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-ink-soft">
                  <span className="truncate">
                    {s.author_name ?? "Anonym"} · {formatDate(s.created_at)}
                  </span>
                  <VoteButton
                    suggestionId={s.id}
                    count={votes?.counts[s.id] ?? 0}
                    hasVoted={votes?.mine.has(s.id) ?? false}
                    title={s.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
