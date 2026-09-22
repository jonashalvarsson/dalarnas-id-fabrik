import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/suggestions";

const inputClasses =
  "mt-2 w-full rounded-xl bg-sand/50 border border-black/10 px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss/40";

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
            <Link to="/forlag" className="transition-colors hover:text-moss">
              Alla förslag
            </Link>
          </nav>
        </header>

        <div className="mx-auto max-w-2xl pb-12">
          <SuggestionForm onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["suggestions"] })} />

          <Link
            to="/forlag"
            className="group mt-6 flex items-center justify-between rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:ring-moss/30"
          >
            <div>
              <p className="text-base font-medium text-ink group-hover:text-moss">Se alla förslag</p>
              <p className="mt-1 text-sm text-ink-soft">
                Bläddra bland alla inskickade förslag som kort – klicka för att läsa mer.
              </p>
            </div>
            <span aria-hidden className="text-xl text-moss transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
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
    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
        Förbättringsförslag
      </p>

      {submitted ? (
        <div className="mt-6">
          <div className="rounded-2xl bg-moss-pale/40 p-6 text-center ring-1 ring-dashed ring-moss/30">
            <p className="font-serif text-lg font-medium text-moss">Tack för ditt förslag!</p>
            <p className="mt-2 text-sm text-ink-soft">
              Det har registrerats och visas nu bland alla förslag.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/forlag"
              className="flex-1 rounded-xl bg-moss py-3 text-center text-sm font-medium text-primary-foreground ring-1 ring-moss/60 transition-colors hover:bg-moss-light focus:outline-none focus:ring-2 focus:ring-moss/50"
            >
              Visa alla förslag
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 rounded-xl border border-moss/30 bg-transparent py-3 text-sm font-medium text-moss transition-colors hover:bg-moss-pale/50 focus:outline-none focus:ring-2 focus:ring-moss/40"
            >
              Lämna ett till förslag
            </button>
          </div>
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
              <label htmlFor="problem" className="block text-sm font-medium text-ink">
                Vilket problem löser förslaget?
              </label>
              <textarea
                id="problem"
                rows={3}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                maxLength={1000}
                placeholder="Beskriv det problem eller hinder som finns i dag"
                className={`${inputClasses} resize-none`}
              />
              {errors["problem"] && (
                <p className="mt-1.5 text-xs text-rose">{errors["problem"]}</p>
              )}
            </div>

            <div>
              <label htmlFor="benefit" className="block text-sm font-medium text-ink">
                Förväntad nytta
              </label>
              <textarea
                id="benefit"
                rows={3}
                value={expectedBenefit}
                onChange={(e) => setExpectedBenefit(e.target.value)}
                maxLength={1000}
                placeholder="Vad blir bättre om förslaget genomförs?"
                className={`${inputClasses} resize-none`}
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
