import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, STATUSES, formatDate, type Suggestion } from "@/lib/suggestions";
import { useVotes } from "@/lib/votes";
import { VoteButton } from "@/components/VoteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const inputClasses = "mt-2";

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

  return (
    <div className="min-h-screen bg-sand font-sans text-ink antialiased">
      <a
        href="#innehall"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Hoppa till innehållet
      </a>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-base font-bold text-primary-foreground">
              R
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-ink">Region Dalarna</p>
              <p className="text-sm text-ink-soft">Förbättringsförslag</p>
            </div>
          </div>
          <nav className="flex items-center text-sm text-ink-soft">
            <Link to="/forlag" className="flex min-h-11 items-center px-3 font-semibold text-primary underline-offset-4 hover:underline">
              Alla förslag
            </Link>
          </nav>
        </header>

        <main id="innehall">
        <div className="mx-auto max-w-2xl pb-12">
          <SuggestionForm onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["suggestions"] })} />

          <Link
            to="/forlag"
            className="group mt-6 flex min-h-20 items-center justify-between rounded-md border border-border bg-card p-5 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div>
              <p className="text-base font-semibold text-primary underline underline-offset-4">Se alla förslag</p>
              <p className="mt-1 text-sm text-ink-soft">
                Läs, sök och rösta på inskickade förslag.
              </p>
            </div>
            <span aria-hidden className="text-xl text-primary">
              →
            </span>
          </Link>
        </div>

        <StatsSection />
        </main>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-ink-soft sm:flex-row sm:items-center">
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
  const [problem, setProblem] = useState("");
  const [expectedBenefit, setExpectedBenefit] = useState("");
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
    const cleanProblem = problem.trim();
    const cleanBenefit = expectedBenefit.trim();
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
    if (cleanProblem.length < 10) {
      nextErrors["problem"] = "Beskriv vilket problem förslaget löser (minst 10 tecken).";
    } else if (cleanProblem.length > 1000) {
      nextErrors["problem"] = "Problembeskrivningen får vara högst 1 000 tecken.";
    }
    if (cleanBenefit.length < 10) {
      nextErrors["expected_benefit"] = "Beskriv den förväntade nyttan (minst 10 tecken).";
    } else if (cleanBenefit.length > 1000) {
      nextErrors["expected_benefit"] = "Beskrivningen av nyttan får vara högst 1 000 tecken.";
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
      problem: cleanProblem,
      expected_benefit: cleanBenefit,
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
    setProblem("");
    setExpectedBenefit("");
    setCategory(CATEGORIES[0]);
    setName("");
    setAnonymous(false);
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  }

  return (
    <div className="rounded-md border border-border bg-card p-6 sm:p-8">

      {submitted ? (
        <div className="mt-6">
          <div className="rounded-md border-l-4 border-primary bg-accent p-6 text-center">
            <p className="text-lg font-bold text-primary">Tack för ditt förslag!</p>
            <p className="mt-2 text-sm text-ink-soft">
              Det har registrerats och visas nu bland alla förslag.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to="/forlag">Visa alla förslag</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Lämna ett till förslag
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="max-w-[24ch] text-3xl font-bold leading-tight text-balance text-ink">
            Lämna ett förbättringsförslag
          </h1>
          <p className="mt-3 max-w-[46ch] text-sm text-pretty text-ink-soft sm:text-base">
             Beskriv din idé och vilken nytta den kan göra. Du behöver inget konto.
          </p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-ink">
                Titel
              </label>
               <Input
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
               <Textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Berätta mer om förslaget och hur det kan hjälpa"
                 className={inputClasses}
              />
              {errors["description"] && (
                <p className="mt-1.5 text-xs text-rose">{errors["description"]}</p>
              )}
            </div>

            <div>
              <label htmlFor="problem" className="block text-sm font-medium text-ink">
                Vilket problem löser förslaget?
              </label>
               <Textarea
                id="problem"
                rows={3}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                maxLength={1000}
                placeholder="Beskriv det problem eller hinder som finns i dag"
                 className={inputClasses}
              />
              {errors["problem"] && (
                <p className="mt-1.5 text-xs text-rose">{errors["problem"]}</p>
              )}
            </div>

            <div>
              <label htmlFor="benefit" className="block text-sm font-medium text-ink">
                Förväntad nytta
              </label>
               <Textarea
                id="benefit"
                rows={3}
                value={expectedBenefit}
                onChange={(e) => setExpectedBenefit(e.target.value)}
                maxLength={1000}
                placeholder="Vad blir bättre om förslaget genomförs?"
                 className={inputClasses}
              />
              {errors["expected_benefit"] && (
                <p className="mt-1.5 text-xs text-rose">{errors["expected_benefit"]}</p>
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
               <Input
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
              <label className="mt-3 flex min-h-11 cursor-pointer select-none items-center gap-3 text-base text-ink-soft">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="size-5 rounded-sm accent-primary"
                />
                Ange mig som anonym
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Skickar…" : "Skicka förslag"}
            </Button>

            {submitError && (
              <p className="rounded-xl bg-rose-pale px-4 py-3 text-center text-xs text-rose">
                {submitError}
              </p>
            )}

            <p className="text-center text-sm text-ink-soft">
              Inget konto krävs. Du kan välja att vara anonym.
            </p>
          </form>
        </>
      )}
    </div>
  );
}

function StatsSection() {
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

  const total = suggestions?.length ?? 0;
  const newCount = suggestions?.filter((s) => s.status === STATUSES[0]).length ?? 0;
  const doneCount = suggestions?.filter((s) => s.status === "Genomfört").length ?? 0;

  const topFive = suggestions
    ? [...suggestions]
        .sort((a, b) => (votes?.counts[b.id] ?? 0) - (votes?.counts[a.id] ?? 0))
        .slice(0, 5)
    : [];

  const cards = [
    { label: "Förslag totalt", value: total },
    { label: "Nya förslag", value: newCount },
    { label: "Genomförda", value: doneCount },
  ];

  return (
    <section aria-label="Statistik" className="pb-12">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-md border border-border bg-card p-4 text-center sm:p-6">
            <p className="text-2xl font-bold text-primary sm:text-3xl">
              {isLoading ? "…" : c.value}
            </p>
            <p className="mt-1 text-xs text-ink-soft sm:text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-border bg-card p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">Mest röstade förslagen</h2>
          <Link
            to="/forlag"
            className="shrink-0 text-sm font-medium text-moss transition-colors hover:text-moss-light"
          >
            Alla förslag →
          </Link>
        </div>

        {isLoading && (
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-sand/70" />
            ))}
          </div>
        )}

        {!isLoading && total === 0 && (
          <p className="mt-4 text-sm text-ink-soft">
            Inga förslag har lämnats ännu – bli den första att lämna ett förslag ovan.
          </p>
        )}

        {!isLoading && total > 0 && (
          <ol className="mt-4 divide-y divide-black/5">
            {topFive.map((s, i) => (
              <li key={s.id}>
                <Link
                  to="/forlag/$id"
                  params={{ id: s.id }}
                  className="group flex items-center gap-3 py-3 transition-colors"
                >
                   <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink group-hover:text-moss">
                      {s.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-soft/80">
                      {s.category} · {s.status} · {formatDate(s.created_at)}
                    </span>
                  </span>
                  <VoteButton
                    suggestionId={s.id}
                    count={votes?.counts[s.id] ?? 0}
                    hasVoted={votes?.mine.has(s.id) ?? false}
                  />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
