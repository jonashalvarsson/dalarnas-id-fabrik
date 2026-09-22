import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_STYLES, formatDate, type Suggestion } from "@/lib/suggestions";

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

  return (
    <>
      <div className="flex items-end justify-between pb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Alla förslag</h1>
          <p className="mt-1 text-sm text-ink-soft">Klicka på ett förslag för att läsa mer.</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-black/5">
          {suggestions ? `${suggestions.length} st` : "…"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/70 ring-1 ring-black/5" />
          ))}

        {!isLoading && suggestions?.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-dashed ring-moss/30 sm:col-span-2 lg:col-span-3">
            <p className="font-serif text-base font-medium text-moss">Inga förslag ännu</p>
            <p className="mt-1 text-sm text-ink-soft">Bli den första att lämna ett förslag.</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-xl bg-moss px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-moss-light"
            >
              Lämna ett förslag
            </Link>
          </div>
        )}

        {suggestions?.map((s) => (
          <Link
            key={s.id}
            to="/forlag/$id"
            params={{ id: s.id }}
            className="group flex flex-col rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:ring-moss/30"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-moss-pale px-2.5 py-1 text-xs font-medium text-moss">
                {s.category}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS_STYLES[s.status] ?? STATUS_STYLES["Ny"]
                }`}
              >
                {s.status}
              </span>
            </div>
            <h2 className="mt-3 text-base font-medium leading-snug text-ink group-hover:text-moss">
              {s.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{s.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-ink-soft/80">
              <span>{s.author_name ?? "Anonym"}</span>
              <span>{formatDate(s.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
