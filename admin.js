const $ = id => document.getElementById(id);
let funciones = [], editando = null;

const aLocal = d => { const x = new Date(d); return new Date(x - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };
const numeroWa = n => (n.length === 10 ? "52" + n : n); // 10 dígitos = número de México sin lada de país

function mensajeWa(f, r) {
  const cuando = `${fmtDia(f.fecha)} a las ${fmtHora(f.fecha)}`;
  const texto = f.estado === "cancelada"
    ? `Hola ${r.nombre}, te avisamos que la función de ${f.pelicula} del ${cuando} fue cancelada. Disculpa las molestias. — Hable con ella`
    : f.aviso
      ? `Hola ${r.nombre}, la función de ${f.pelicula} cambió de horario: ahora es el ${cuando}. ¡Te esperamos! — Hable con ella`
      : `Hola ${r.nombre}, te recordamos tu reserva para ${f.pelicula} el ${cuando}. — Hable con ella`;
  return `https://wa.me/${numeroWa(r.whatsapp)}?text=${encodeURIComponent(texto)}`;
}

async function entrar() {
  const { data } = await db.rpc("es_admin");
  if (!data) { await db.auth.signOut(); $("l-error").textContent = "Esta cuenta no es administradora."; return; }
  $("login").hidden = true; $("panel").hidden = false; $("salir").hidden = false;
  cargar();
}

async function cargar() {
  const desde = new Date(); desde.setHours(0, 0, 0, 0);
  const { data, error } = await db.from("funciones").select("*, reservas(id, nombre, whatsapp)")
    .gte("fecha", desde.toISOString()).order("fecha");
  if (error) return ($("lista").innerHTML = `<p class="error">${esc(error.message)}</p>`);
  funciones = data;
  $("lista").innerHTML = data.length ? data.map(fila).join("") : `<p class="nota">No hay funciones próximas.</p>`;
}

function fila(f) {
  const cancelada = f.estado === "cancelada";
  return `<div class="fila"><header>
      <div><h3>${esc(f.pelicula)}</h3>
        <div class="nota">${esc(fmtDia(f.fecha))} · ${fmtHora(f.fecha)} · ${f.reservas.length} reserva(s)</div>
        ${cancelada ? `<span class="etiqueta cancelada">Cancelada</span>` : f.aviso ? `<span class="etiqueta aviso">${esc(f.aviso)}</span>` : ""}
      </div>
      <div class="acciones" style="margin:0">
        <button class="sec" onclick="editar('${f.id}')">Editar</button>
        <button class="sec" onclick="cambiarEstado('${f.id}')">${cancelada ? "Reactivar" : "Cancelar"}</button>
      </div></header>
    ${f.reservas.length ? `<div class="reservas">${f.reservas.map(r => `<div>
        <span>${esc(r.nombre)} · <span class="nota">${esc(r.whatsapp)}</span></span>
        <a class="boton wa" target="_blank" rel="noopener" href="${mensajeWa(f, r)}" onclick="this.classList.add('enviado')">Avisar por WhatsApp</a>
      </div>`).join("")}</div>` : ""}
  </div>`;
}

function editar(id) {
  editando = funciones.find(f => f.id === id);
  $("f-modo").textContent = `Editando: ${editando.pelicula}`;
  $("f-pelicula").value = editando.pelicula;
  $("f-fecha").value = aLocal(editando.fecha);
  $("f-detalle").value = editando.detalle || "";
  $("f-poster").value = editando.poster_url || "";
  scrollTo({ top: 0, behavior: "smooth" });
}

function limpiar() { editando = null; $("form-funcion").reset(); $("f-modo").textContent = "Nueva función"; $("f-error").textContent = ""; }

async function cambiarEstado(id) {
  const f = funciones.find(x => x.id === id);
  const estado = f.estado === "cancelada" ? "activa" : "cancelada";
  if (estado === "cancelada" && !confirm(`¿Cancelar ${f.pelicula}? Después avisa a las ${f.reservas.length} reserva(s) con los botones de WhatsApp.`)) return;
  await db.from("funciones").update({ estado }).eq("id", id);
  cargar();
}

$("form-funcion").onsubmit = async e => {
  e.preventDefault();
  const fecha = new Date($("f-fecha").value).toISOString();
  const datos = { pelicula: $("f-pelicula").value.trim(), fecha, detalle: $("f-detalle").value.trim() || null, poster_url: $("f-poster").value.trim() || null };
  if (editando && new Date(editando.fecha).getTime() !== new Date(fecha).getTime())
    datos.aviso = `Nuevo horario (antes ${fmtDia(editando.fecha)}, ${fmtHora(editando.fecha)})`;
  const { error } = editando
    ? await db.from("funciones").update(datos).eq("id", editando.id)
    : await db.from("funciones").insert(datos);
  if (error) return ($("f-error").textContent = error.message);
  limpiar(); cargar();
};

$("f-limpiar").onclick = limpiar;
$("salir").onclick = async e => { e.preventDefault(); await db.auth.signOut(); location.reload(); };
$("login").onsubmit = async e => {
  e.preventDefault();
  const { error } = await db.auth.signInWithPassword({ email: $("l-correo").value, password: $("l-clave").value });
  if (error) return ($("l-error").textContent = "Correo o contraseña incorrectos.");
  entrar();
};

if (!db) $("login").outerHTML = `<p class="error">Falta configurar Supabase en comun.js.</p>`;
else db.auth.getSession().then(({ data }) => data.session && entrar());
