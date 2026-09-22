import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, type Suggestion } from "@/lib/suggestions";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { useVotes } from "@/lib/votes";
import { VoteButton } from "@/components/VoteButton";
import { Star } from "lucide-react";

export const Route = createFileRoute("/forlag/$id")({
  head: () => ({
    meta: [
      { title: "Förslag – Förbättringsposten" },
      {
        name: "description",
        content: "Läs hela förbättringsförslaget: beskrivning, problem och förväntad nytta.",
      },
      { property: "og:title", content: "Förslag – Förbättringsposten" },
      {
        property: "og:description",
        content: "Läs hela förbättringsförslaget: beskrivning, problem och förväntad nytta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuggestionDetail,
  notFoundComponent: SuggestionNotFound,
});

function SuggestionDetail() {
  const { id } = Route.useParams();
  const { data: votes } = useVotes();

  const { data: suggestion, isLoading } = useQuery({
    queryKey: ["suggestion", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("suggestions").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Suggestion;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="h-8 w-40 animate-pulse rounded-full bg-white/70" />
        <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-black/5" />
      </div>
    );
  }

  if (!suggestion) return <SuggestionNotFound />;

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <Link
        to="/forlag"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-moss"
      >
        ← Alla förslag
      </Link>

      <article className="mt-5 rounded-md border border-border border-l-4 border-l-primary bg-card p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-2">
          {suggestion.is_prioritized && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-pale px-2.5 py-1 text-xs font-bold text-amber">
              <Star aria-hidden="true" className="size-3.5" />
              Prioriterat
            </span>
          )}
          <CategoryBadge category={suggestion.category} />
          <StatusBadge status={suggestion.status} />
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-balance text-ink">
          {suggestion.title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft/80">
          {suggestion.author_name ?? "Anonym"} · {formatDate(suggestion.created_at)}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <VoteButton
            suggestionId={suggestion.id}
            count={votes?.counts[suggestion.id] ?? 0}
            hasVoted={votes?.mine.has(suggestion.id) ?? false}
            size="lg"
          />
          <span className="text-base text-ink-soft">
            {(votes?.counts[suggestion.id] ?? 0) === 1 ? "1 person har" : `${votes?.counts[suggestion.id] ?? 0} personer har`} röstat på det här förslaget
          </span>
        </div>

        <div className="mt-7 space-y-7">
          <Section label="Beskrivning">{suggestion.description}</Section>
          {suggestion.problem && (
            <Section label="Vilket problem löser förslaget?">{suggestion.problem}</Section>
          )}
          {suggestion.expected_benefit && (
            <Section label="Förväntad nytta">{suggestion.expected_benefit}</Section>
          )}
        </div>

        {suggestion.admin_comment && (
          <div className="mt-7 rounded-md border-l-4 border-primary bg-accent p-5">
            <h2 className="text-sm font-bold text-primary">
              Kommentar från ansvarig
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft sm:text-base">
              {suggestion.admin_comment}
            </p>
            {suggestion.status_updated_at && (
              <p className="mt-3 text-xs text-ink-soft/80">
                Uppdaterad {formatDate(suggestion.status_updated_at)}
              </p>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink">{label}</h2>
      <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-pretty text-ink-soft">
        {children}
      </p>
    </section>
  );
}

function SuggestionNotFound() {
  return (
    <div className="mx-auto max-w-3xl pb-12">
      <Link
        to="/forlag"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-moss"
      >
        ← Alla förslag
      </Link>
      <div className="mt-6 rounded-md border border-border bg-card p-10 text-center">
        <p className="font-serif text-lg font-medium text-moss">Förslaget hittades inte</p>
        <p className="mt-2 text-sm text-ink-soft">
          Det kan ha tagits bort. Gå tillbaka och välj ett annat förslag.
        </p>
      </div>
    </div>
  );
}
