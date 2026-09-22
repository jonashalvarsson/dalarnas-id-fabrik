import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  author_name: string | null;
  created_at: string;
};

const CATEGORIES = [
  "Patientvård",
  "Arbetsmiljö",
  "IT & system",
  "Samarbete",
  "Lokaler",
  "Övrigt",
] as const;

const STATUS_STYLES: Record<string, string> = {
  Ny: "bg-sand-dark text-ink-soft",
  Pågår: "bg-rose-pale text-rose",
  Klar: "bg-moss-pale text-moss",
};

const inputClasses =
  "mt-2 w-full rounded-xl bg-sand/50 border border-black/10 px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss/40";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Förbättringsposten – lämna förslag" },
      {
        name: "description",
        content:
          "Lämna förbättringsförslag till Region Dalarna. Inget konto krävs – skriv, välj kategori och skicka.",
      },
      { property: "og:title", content: "Förbättringsposten – Region Dalarna" },
      {
        property: "og:description",
        content:
          "Lämna förbättringsförslag till Region Dalarna. Inget konto krävs – skriv, välj kategori och skicka.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Suggestion[];
    },
  });

  return (
    <div className="min-h-screen bg-sand font-sans text-ink antialiased">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between pb-8 sm:pb-10">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-moss font-serif text-base font-semibold text-primary-foreground">
              R
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Region Dalarna</p>
              <p className="text-xs text-ink-soft">Förbättringsposten</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-ink-soft sm:flex">
            <a href="#forlagen" className="transition-colors hover:text-moss">
              Tidigare förslag
            </a>
          </nav>
        </header>

        <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-12 lg:gap-10">
          <section className="lg:col-span-5">
            <SuggestionForm onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["suggestions"] })} />
          </section>

          <section id="forlagen" className="lg:col-span-7">
            <div className="flex items-end justify-between pb-5">
              <div>
                <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
                  Tidigare förslag
                </h2>
                <p className="mt-1 text-sm text-ink-soft">Så ser andras bidrag ut i dag.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-black/5">
                {suggestions ? `${suggestions.length} st` : "…"}
              </span>
            </div>

            <div className="space-y-3">
              {isLoading &&
                [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl bg-white/70 ring-1 ring-black/5"
                  />
                ))}

              {!isLoading && suggestions?.length === 0 && (
                <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-dashed ring-moss/30">
                  <p className="font-serif text-base font-medium text-moss">
                    Inga förslag ännu
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Bli den första att lämna ett förslag – formuläret finns till vänster.
                  </p>
                </div>
              )}

              {suggestions?.map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-colors hover:ring-moss/25"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-medium leading-snug text-ink">{s.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[s.status] ?? STATUS_STYLES["Ny"]
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-pretty text-ink-soft">{s.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-moss-pale px-2.5 py-1 text-xs font-medium text-moss">
                      {s.category}
                    </span>
                    <span className="text-xs text-ink-soft/80">
                      {s.author_name ?? "Anonym"} · {formatDate(s.created_at)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 text-xs text-ink-soft/80 sm:flex-row sm:items-center">
          <p>Region Dalarna · Intern förbättringstjänst</p>
          <p>Frågor? Kontakta förbättringskoordinatören.</p>
        </footer>
      </div>
    </div>
  );
}

function SuggestionForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanName = anonymous ? "" : name.trim();

    if (cleanTitle.length < 5) {
      nextErrors["title"] = "Ge förslaget en titel med minst 5 tecken.";
    } else if (cleanTitle.length > 120) {
      nextErrors["title"] = "Titeln får vara högst 120 tecken.";
    }
    if (cleanDescription.length < 10) {
      nextErrors["description"] = "Beskriv förslaget med minst 10 tecken.";
    } else if (cleanDescription.length > 2000) {
      nextErrors["description"] = "Beskrivningen får vara högst 2 000 tecken.";
    }
    if (cleanName.length > 80) {
      nextErrors["name"] = "Namnet får vara högst 80 tecken.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    const { error } = await supabase.from("suggestions").insert({
      title: cleanTitle,
      description: cleanDescription,
      category,
      author_name: cleanName.length > 0 ? cleanName : null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("Något gick fel när förslaget skickades. Försök igen om en stund.");
      return;
    }

    setSubmitted(true);
    onSubmitted();
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setName("");
    setAnonymous(false);
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
        Förbättringsförslag
      </p>

      {submitted ? (
        <div className="mt-6">
          <div className="rounded-2xl bg-moss-pale/40 p-6 text-center ring-1 ring-dashed ring-moss/30">
            <p className="font-serif text-lg font-medium text-moss">Tack för ditt förslag!</p>
            <p className="mt-2 text-sm text-ink-soft">
              Det har registrerats och visas nu i listan under ”Tidigare förslag”.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="mt-5 w-full rounded-xl border border-moss/30 bg-transparent py-3 text-sm font-medium text-moss transition-colors hover:bg-moss-pale/50 focus:outline-none focus:ring-2 focus:ring-moss/40"
          >
            Lämna ett till förslag
          </button>
        </div>
      ) : (
        <>
          <h1 className="mt-3 max-w-[24ch] font-serif text-3xl font-semibold leading-tight text-balance text-ink sm:text-[2.25rem]">
            Lämna förbättringsförslag
          </h1>
          <p className="mt-3 max-w-[46ch] text-sm text-pretty text-ink-soft sm:text-base">
            Dina idéer gör vår vardag bättre. Vi läser varje förslag och återkommer till dig.
          </p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-ink">
                Titel
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="Kort sammanfattning av ditt förslag"
                className={inputClasses}
              />
              {errors["title"] && <p className="mt-1.5 text-xs text-rose">{errors["title"]}</p>}
            </div>

            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-ink">
                Beskrivning
              </label>
              <textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Berätta mer om förslaget och hur det kan hjälpa"
                className={`${inputClasses} resize-none`}
              />
              {errors["description"] && (
                <p className="mt-1.5 text-xs text-rose">{errors["description"]}</p>
              )}
            </div>

            <div>
              <label htmlFor="cat" className="block text-sm font-medium text-ink">
                Kategori
              </label>
              <select
                id="cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClasses}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink">
                Namn <span className="font-normal text-ink-soft">(valfritt)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                disabled={anonymous}
                placeholder={anonymous ? "Anonymt förslag" : "Ditt namn"}
                className={`${inputClasses} disabled:cursor-not-allowed disabled:opacity-50`}
              />
              {errors["name"] && <p className="mt-1.5 text-xs text-rose">{errors["name"]}</p>}
              <label className="mt-2 flex cursor-pointer select-none items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="size-4 rounded-sm border-black/15 accent-moss"
                />
                Ange mig som anonym
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-moss py-3.5 text-sm font-medium text-primary-foreground ring-1 ring-moss/60 transition-colors hover:bg-moss-light focus:outline-none focus:ring-2 focus:ring-moss/50 disabled:opacity-60"
            >
              {submitting ? "Skickar…" : "Skicka förslag"}
            </button>

            {submitError && (
              <p className="rounded-xl bg-rose-pale px-4 py-3 text-center text-xs text-rose">
                {submitError}
              </p>
            )}

            <p className="text-center text-xs text-ink-soft/80">
              Inget konto krävs. Dina uppgifter hanteras konfidentiellt.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
