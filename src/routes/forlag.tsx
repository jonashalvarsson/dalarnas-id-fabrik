import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forlag")({
  component: ForlagLayout,
});

function ForlagLayout() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-sand font-sans text-ink antialiased">
      <a
        href="#innehall"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Hoppa till innehållet
      </a>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-base font-bold text-primary-foreground">
              R
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-ink">Region Dalarna</p>
              <p className="text-sm text-ink-soft">Förbättringsförslag</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <Link to="/forlag" className="flex min-h-11 items-center px-3 underline-offset-4 hover:underline" activeProps={{ className: "font-semibold text-primary underline" }}>
              Alla förslag
            </Link>
            <Link to="/" className="flex min-h-11 items-center px-3 underline-offset-4 hover:text-primary hover:underline">
              Lämna förslag
            </Link>
            {!loading && user ? (
              <>
                <Link to="/administration" className="flex min-h-11 items-center px-3 underline-offset-4 hover:text-primary hover:underline">
                  Administration
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={handleSignOut}
                  className="text-ink-soft hover:text-primary"
                >
                  Logga ut
                </Button>
              </>
            ) : (
              <Link to="/auth" className="flex min-h-11 items-center px-3 underline-offset-4 hover:text-primary hover:underline">
                Logga in
              </Link>
            )}

          </nav>
        </header>

        <main id="innehall">
          <Outlet />
        </main>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-ink-soft sm:flex-row sm:items-center">
          <p>Region Dalarna · Intern förbättringstjänst</p>
          <p>Frågor? Kontakta förbättringskoordinatören.</p>
        </footer>
      </div>
    </div>
  );
}
