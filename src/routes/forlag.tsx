import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/useSession";

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
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between pb-8 sm:pb-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-moss font-serif text-base font-semibold text-primary-foreground">
              R
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Region Dalarna</p>
              <p className="text-xs text-ink-soft">Förbättringsposten</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink-soft sm:flex">
            <Link to="/forlag" activeProps={{ className: "font-medium text-moss" }}>
              Alla förslag
            </Link>
            <Link to="/" className="transition-colors hover:text-moss">
              Lämna förslag
            </Link>
            {!loading && user ? (
              <>
                <Link to="/administration" className="transition-colors hover:text-moss">
                  Administration
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="transition-colors hover:text-moss"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <Link to="/auth" className="transition-colors hover:text-moss">
                Logga in
              </Link>
            )}

          </nav>
        </header>

        <Outlet />

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-6 text-xs text-ink-soft/80 sm:flex-row sm:items-center">
          <p>Region Dalarna · Intern förbättringstjänst</p>
          <p>Frågor? Kontakta förbättringskoordinatören.</p>
        </footer>
      </div>
    </div>
  );
}
