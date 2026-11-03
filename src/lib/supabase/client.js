import { createClient } from "@supabase/supabase-js";
// Един клиент за цялото приложение. Ползваме „implicit“ потока: линковете от писмата
// (потвърждение, нова парола) носят сесията в самия линк и работят във всеки браузър и на телефон.
// PKCE потокът изисква линкът да е отворен в същия браузър, от който е поискано писмото.
let client = null;
export const supabaseBrowser = () => {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        flowType: "implicit",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
};
