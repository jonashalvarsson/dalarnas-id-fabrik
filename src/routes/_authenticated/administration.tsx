import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminRole } from "@/lib/admin.functions";
import { STATUSES, STATUS_STYLES, formatDate, type Suggestion } from "@/lib/suggestions";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/administration")({
  head: () => ({
    meta: [
      { title: "Administration – Förbättringsposten" },
      {
        name: "description",
        content: "Ändra status och skriv en kommentar om vad som händer med varje förbättringsförslag.",
      },
      { property: "og:title", content: "Administration – Förbättringsposten" },
      {
        property: "og:description",
        content: "Följ upp förbättringsförslag: ändra status och kommentera.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(ensureAdminRole);

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => checkAdmin({ data: undefined }),
  });

  const { data: suggestions } = useQuery({
    queryKey: ["admin-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Suggestion[];
    },
    enabled: access?.isAdmin === true,
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-sand font-sans text-ink antialiased">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-base font-bold text-primary-foreground">
              R
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Region Dalarna</p>
              <p className="text-xs text-ink-soft">Administration</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-sm text-ink-soft">
            <Link to="/forlag" className="transition-colors hover:text-moss">
              Alla förslag
            </Link>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              Logga ut
            </Button>
          </div>
        </header>

        <h1 className="text-3xl font-bold text-ink">
          Följ upp förslagen
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Inloggad som {user?.email ?? "ansvarig"}. Ändra status och skriv en kommentar om vad som
          händer med förslaget – kommentaren visas för alla som läser förslaget.
        </p>

        {accessLoading && (
          <div className="mt-8 space-y-4">
            <div className="h-36 animate-pulse rounded-2xl bg-white/70" />
            <div className="h-36 animate-pulse rounded-2xl bg-white/70" />
          </div>
        )}

        {!accessLoading && access?.isAdmin === false && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-dashed ring-moss/30">
            <p className="font-serif text-lg font-medium text-moss">Du har inte behörighet</p>
            <p className="mt-2 text-sm text-ink-soft">
              Ditt konto är inte upplagt som ansvarig. Kontakta den som ansvarar för
              Förbättringsposten.
            </p>
          </div>
        )}

        {access?.isAdmin && (
          <div className="mt-8 space-y-5">
            {suggestions?.map((suggestion) => (
              <AdminCard key={suggestion.id} suggestion={suggestion} />
            ))}
            {suggestions?.length === 0 && (
              <p className="rounded-2xl bg-white p-8 text-center text-sm text-ink-soft ring-1 ring-dashed ring-moss/30">
                Det finns inga förslag ännu.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCard({ suggestion }: { suggestion: Suggestion }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(suggestion.status);
  const [comment, setComment] = useState(suggestion.admin_comment ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStatus(suggestion.status);
    setComment(suggestion.admin_comment ?? "");
  }, [suggestion.status, suggestion.admin_comment]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("suggestions")
        .update({
          status,
          admin_comment: comment,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", suggestion.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await queryClient.invalidateQueries({ queryKey: ["admin-suggestions"] });
      await queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      await queryClient.invalidateQueries({ queryKey: ["suggestion", suggestion.id] });
    },
  });

  const dirty = status !== suggestion.status || comment !== (suggestion.admin_comment ?? "");

  return (
    <article className="rounded-md border border-border border-l-4 border-l-primary bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-moss-pale px-2.5 py-1 text-xs font-medium text-moss">
          {suggestion.category}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[suggestion.status] ?? STATUS_STYLES["Nytt"]
          }`}
        >
          {suggestion.status}
        </span>
        <span className="text-xs text-ink-soft/80">{formatDate(suggestion.created_at)}</span>
      </div>

      <h2 className="mt-3 text-lg font-bold text-ink">
        <Link
          to="/forlag/$id"
          params={{ id: suggestion.id }}
          className="transition-colors hover:text-moss"
        >
          {suggestion.title}
        </Link>
      </h2>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{suggestion.description}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,15rem)_1fr]">
        <div>
          <label
            htmlFor={`status-${suggestion.id}`}
             className="text-sm font-semibold text-ink"
          >
            Status
          </label>
          <select
            id={`status-${suggestion.id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 min-h-12 w-full rounded-md border border-input bg-card px-4 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor={`comment-${suggestion.id}`}
            className="text-sm font-semibold text-ink"
          >
            Kommentar från ansvarig
          </label>
          <Textarea
            id={`comment-${suggestion.id}`}
            value={comment}
            rows={3}
            maxLength={1000}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Vad händer med förslaget?"
            className="mt-2 resize-y"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => save.mutate()}
          disabled={!dirty || save.isPending}
        >
          {save.isPending ? "Sparar…" : "Spara ändringar"}
        </Button>
        {saved && <span className="text-sm text-moss">Sparat</span>}
        {save.isError && (
          <span className="text-sm text-rose">Kunde inte spara. Försök igen.</span>
        )}
      </div>
    </article>
  );
}
