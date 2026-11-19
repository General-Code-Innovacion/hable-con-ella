// Los ids con guion no son variables globales: se enlazan a mano.
const $ = id => document.getElementById(id);
const [r_titulo, r_cuando, r_error, form_reserva, r_listo, r_tel, r_nombre, r_mensaje, r_dm] =
  ["r-titulo", "r-cuando", "r-error", "form-reserva", "r-listo", "r-tel", "r-nombre", "r-mensaje", "r-dm"].map($);


const perfil = `https://www.instagram.com/${HCE.instagram}`;
ig.href = ig2.href = perfil; ig2.textContent = "@" + HCE.instagram;
anio.textContent = new Date().getFullYear();

// Sin Supabase configurado se muestra un ejemplo para poder ver el diseño.
const EJEMPLO = [
  { id: "e1", pelicula: "Hable con ella", detalle: "Pedro Almodóvar · 2002 · 112 min", fecha: new Date(Date.now() + 2 * 864e5).setHours(20, 0), estado: "activa" },
  { id: "e2", pelicula: "Todo sobre mi madre", detalle: "Pedro Almodóvar · 1999 · 101 min", fecha: new Date(Date.now() + 3 * 864e5).setHours(19, 0), estado: "activa", aviso: "Nuevo horario" },
  { id: "e3", pelicula: "Y tu mamá también", detalle: "Alfonso Cuarón · 2001 · 106 min", fecha: new Date(Date.now() + 4 * 864e5).setHours(18, 30), estado: "cancelada" },
];

let funciones = [], actual = null;

async function cargar() {
  if (db) {
    const desde = new Date(); desde.setHours(0, 0, 0, 0);
    const { data, error } = await db.from("funciones").select("*").gte("fecha", desde.toISOString()).order("fecha");
    if (error) return (cartelera.innerHTML = `<p class="error">No se pudo cargar la cartelera.</p>`);
    funciones = data;
  } else funciones = EJEMPLO;

  if (!funciones.length) return (cartelera.innerHTML = `<p class="nota">Pronto anunciaremos nuevas funciones.</p>`);
  cartelera.innerHTML = `<div class="grilla">${funciones.map(tarjeta).join("")}</div>`;
}

function tarjeta(f) {
  const cancelada = f.estado === "cancelada";
  return `<article class="funcion ${cancelada ? "cancelada-card" : ""}">
    <div class="poster ${f.poster_url ? "" : "vacio"}" style="${f.poster_url ? `background-image:url('${encodeURI(f.poster_url)}')` : ""}">${f.poster_url ? "" : esc(f.pelicula)}</div>
    <div class="info">
      ${cancelada ? `<span class="etiqueta cancelada">Cancelada</span>` : f.aviso ? `<span class="etiqueta aviso">${esc(f.aviso)}</span>` : ""}
      <h3>${esc(f.pelicula)}</h3>
      ${f.detalle ? `<div class="detalle">${esc(f.detalle)}</div>` : ""}
      <div class="dia">${esc(fmtDia(f.fecha))}</div>
      <div class="hora">${fmtHora(f.fecha)}</div>
      ${cancelada ? "" : `<button onclick="abrir('${f.id}')">Reservar</button>`}
    </div></article>`;
}

function abrir(id) {
  actual = funciones.find(f => f.id === id);
  r_titulo.textContent = actual.pelicula;
  r_cuando.textContent = `${fmtDia(actual.fecha)} · ${fmtHora(actual.fecha)}`;
  r_error.textContent = ""; form_reserva.hidden = false; r_listo.hidden = true;
  reserva.showModal();
}

form_reserva.onsubmit = async e => {
  e.preventDefault();
  const whatsapp = r_tel.value.replace(/\D/g, "");
  if (whatsapp.length < 10 || whatsapp.length > 15) return (r_error.textContent = "Escribe tu número a 10 dígitos.");
  if (db) {
    const { error } = await db.from("reservas").insert({ funcion_id: actual.id, nombre: r_nombre.value.trim(), whatsapp });
    if (error) return (r_error.textContent = "No se pudo registrar. Intenta de nuevo.");
  }
  const mensaje = `Quiero reservar la función ${actual.pelicula}`;
  r_mensaje.textContent = `“${mensaje}”`;
  // Instagram no permite precargar texto en el DM: se copia al portapapeles al abrirlo.
  r_dm.href = `https://ig.me/m/${HCE.instagram}`;
  r_dm.onclick = () => navigator.clipboard?.writeText(mensaje).catch(() => {});
  form_reserva.hidden = true; r_listo.hidden = false;
};

cargar();
