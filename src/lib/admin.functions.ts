import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns whether the signed-in user is an admin.
 * Bootstrap: if no admin exists yet, the first signed-in user becomes admin.
 */
export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (error) throw error;

    const admins = data ?? [];
    if (admins.some((row) => row.user_id === context.userId)) return { isAdmin: true };

    if (admins.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "admin" });
      if (insertError) throw insertError;
      return { isAdmin: true };
    }

    return { isAdmin: false };
  });
