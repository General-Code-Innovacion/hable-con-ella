// Configuración: copia la URL y la "anon public key" de Supabase (Project Settings → API).
// La anon key es pública por diseño; la seguridad la dan las políticas RLS de schema.sql.
const HCE = { supabaseUrl: "", supabaseKey: "", instagram: "hableconella.ca" };

const db = HCE.supabaseUrl ? supabase.createClient(HCE.supabaseUrl, HCE.supabaseKey) : null;

const fmtDia = d => new Date(d).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
const fmtHora = d => new Date(d).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
