import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in – Förbättringsposten" },
      {
        name: "description",
        content: "Logga in som ansvarig för att ändra status och kommentera förbättringsförslag.",
      },
      { property: "og:title", content: "Logga in – Förbättringsposten" },
      {
        property: "og:description",
        content: "Logga in som ansvarig för att följa upp förbättringsförslag.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/administration", replace: true });
  }, [user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth" },
      });
      if (signUpError) setError(translate(signUpError.message));
      else if (!data.session)
        setInfo("Kontot är skapat. Öppna länken vi skickade till din e-post för att bekräfta.");
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(translate(signInError.message));
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-sand font-sans text-ink antialiased">
      <div className="mx-auto flex max-w-md flex-col px-5 py-12 sm:py-20">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-base font-bold text-primary-foreground">
            R
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">Region Dalarna</p>
            <p className="text-xs text-ink-soft">Förbättringsposten</p>
          </div>
        </Link>

        <main className="mt-8 rounded-md border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink">
            {mode === "login" ? "Logga in som ansvarig" : "Skapa konto som ansvarig"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Inloggning behövs bara för att följa upp förslag. Medarbetare kan lämna förslag utan
            konto.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-ink">
                E-postadress
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                aria-required="true"
                aria-invalid={error ? true : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                placeholder="fornamn.efternamn@regiondalarna.se"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-ink">
                Lösenord
              </label>
              <p id="password-hint" className="mt-1 text-sm text-ink-soft">
                Minst 6 tecken.
              </p>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                aria-required="true"
                aria-describedby="password-hint"
                aria-invalid={error ? true : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>

            <div aria-live="assertive">
              {error && (
                <p className="rounded-md border-l-4 border-rose bg-rose-pale px-4 py-3 text-sm font-semibold text-rose">
                  {error}
                </p>
              )}
              {info && (
                <p className="rounded-md border-l-4 border-moss bg-moss-pale px-4 py-3 text-sm font-semibold text-moss">
                  {info}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full"
            >
              {busy ? "Ett ögonblick…" : mode === "login" ? "Logga in" : "Skapa konto"}
            </Button>
          </form>

          <Button
            variant="link"
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="mt-5 h-auto min-h-11 justify-start px-0 text-ink-soft"
          >
            {mode === "login" ? "Jag har inget konto än" : "Jag har redan ett konto"}
          </Button>
        </main>

        <Link to="/" className="mt-6 flex min-h-11 items-center text-sm text-ink-soft hover:text-primary">
          ← Till startsidan
        </Link>
      </div>
    </div>
  );
}

function translate(message: string) {
  if (/invalid login credentials/i.test(message)) return "Fel e-postadress eller lösenord.";
  if (/email not confirmed/i.test(message))
    return "Bekräfta din e-postadress via länken vi skickade innan du loggar in.";
  if (/user already registered/i.test(message))
    return "Det finns redan ett konto med den e-postadressen. Logga in i stället.";
  if (/password/i.test(message) && /least/i.test(message))
    return "Lösenordet måste vara minst 6 tecken.";
  return "Något gick fel. Försök igen.";
}
