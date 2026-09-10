/**
 * LectorIEP — App shell compartido (sesión, navegación, utilidades UI)
 */

const SESSION_KEY = "lectoriep_sesion";

/**
 * Catálogo maestro de módulos (usado para pintar el menú lateral según los permisos
 * de cada usuario — ver usuario.modulosPermitidos, asignado desde Configuración).
 */
const TODOS_LOS_MODULOS = [
  { href: "estudiante.html", icon: "bi-speedometer2", label: "Mi lectura" },
  { href: "bitacora.html", icon: "bi-journal-text", label: "Bitácora" },
  { href: "biblioteca.html", icon: "bi-book-half", label: "Catálogo" },
  { href: "prestamos.html", icon: "bi-arrow-left-right", label: "Préstamos" },
  { href: "evaluaciones.html", icon: "bi-patch-check", label: "Evaluaciones" },
  { href: "ranking.html", icon: "bi-trophy", label: "Ranking" },
  { href: "premios.html", icon: "bi-gift", label: "Premios" },
  { href: "docente.html", icon: "bi-easel", label: "Panel docente" },
  { href: "admin.html", icon: "bi-mortarboard", label: "Panel CIST" },
  { href: "configuracion.html", icon: "bi-gear", label: "Configuración" },
  { href: "reportes.html", icon: "bi-bar-chart-line", label: "Reportes" },
  { href: "basededatos.html", icon: "bi-hdd-network", label: "Base de datos" },
  { href: "padre.html", icon: "bi-people", label: "Seguimiento" },
  { href: "perfil.html", icon: "bi-person-circle", label: "Mi perfil" }
];

const ROL_LABEL = {
  admin: "Coordinador CIST",
  docente: "Docente",
  bibliotecario: "Bibliotecario(a)",
  estudiante: "Estudiante",
  padre: "Padre / Madre de familia"
};

function getSesion() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function requireAuth() {
  const sesion = getSesion();
  if (!sesion) { window.location.href = "../index.html"; return null; }
  return sesion;
}

function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "../index.html";
}

function iniciarSesion(email, password) {
  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!usuario) return { ok: false };
  if (!usuarioActivo(usuario)) return { ok: false, inactivo: true };
  const sesion = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, avatar: usuario.avatar };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  return { ok: true, usuario };
}

/** Primer módulo al que este usuario tiene acceso — a dónde mandarlo tras iniciar sesión
 *  o si intenta abrir una página que no le corresponde. */
function primeraPaginaPermitida(usuario) {
  const permitidos = Array.isArray(usuario.modulosPermitidos) && usuario.modulosPermitidos.length
    ? usuario.modulosPermitidos : modulosPorDefecto(usuario.rol);
  return permitidos[0] || "perfil.html";
}

// Se mantiene por compatibilidad con código existente que redirige por rol.
function paginaInicioPorRol(rol) {
  return { admin: "admin.html", docente: "docente.html", bibliotecario: "biblioteca.html", estudiante: "estudiante.html", padre: "padre.html" }[rol] || "perfil.html";
}

function renderShell(activeHref) {
  const sesion = requireAuth();
  if (!sesion) return null;
  const usuario = getUserById(sesion.id);
  if (!usuario || !usuarioActivo(usuario)) { cerrarSesion(); return null; }

  const permitidos = Array.isArray(usuario.modulosPermitidos) && usuario.modulosPermitidos.length
    ? usuario.modulosPermitidos : modulosPorDefecto(usuario.rol);

  // Control de acceso centralizado: si esta página no está entre sus módulos permitidos,
  // lo mandamos a la primera que sí tiene. (La navegación tarda un instante; el resto de
  // este render es inofensivo aunque se ejecute justo antes de que el navegador cambie de página.)
  if (activeHref && !permitidos.includes(activeHref)) {
    window.location.href = primeraPaginaPermitida(usuario);
  }

  const items = TODOS_LOS_MODULOS.filter(m => permitidos.includes(m.href));

  const sidebar = document.getElementById("app-sidebar");
  const topbar = document.getElementById("app-topbar");

  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <span class="brand-mark"><i class="bi bi-book"></i></span>
        <div>
          <div class="brand-title">LectorIEP</div>
          <div class="brand-sub">IEP 20150 · Mariscal Benavides</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${items.map(it => `<a class="sidebar-link ${activeHref === it.href ? "active" : ""}" href="${it.href}">
            <i class="bi ${it.icon}"></i><span>${it.label}</span>
          </a>`).join("")}
      </nav>
      <button class="sidebar-logout" onclick="cerrarSesion()"><i class="bi bi-box-arrow-left"></i><span>Cerrar sesión</span></button>
    `;
  }

  if (topbar) {
    const inicial = (usuario.avatar || "??");
    const notifs = typeof generarNotificaciones === "function" ? generarNotificaciones(usuario) : [];
    topbar.innerHTML = `
      <button class="topbar-toggle d-lg-none" onclick="document.body.classList.toggle('sidebar-open')"><i class="bi bi-list"></i></button>
      <div class="topbar-spacer"></div>
      <div class="notif-wrap">
        <button class="notif-bell" id="notif-bell-btn"><i class="bi bi-bell"></i>${notifs.length ? `<span class="notif-dot">${notifs.length}</span>` : ""}</button>
        <div class="notif-panel" id="notif-panel">
          <div class="notif-panel-title">Notificaciones</div>
          ${notifs.length ? notifs.map(n => `<div class="notif-row notif-${n.tipo}"><i class="bi ${n.icono}"></i><span>${n.texto}</span></div>`).join("")
            : `<div class="notif-row"><i class="bi bi-check2-circle"></i><span>Todo al día por ahora.</span></div>`}
        </div>
      </div>
      ${usuarioTieneModulo(usuario, "basededatos.html") ? `<button class="db-status-pill" id="db-status-pill" title="Estado del archivo de base de datos">
          <i class="bi bi-hdd-network"></i><span id="db-status-texto">Base de datos</span>
        </button>` : ""}
      <div class="topbar-user">
        <div class="topbar-user-info">
          <div class="topbar-user-name">${usuario.nombre}</div>
          <div class="topbar-user-role">${ROL_LABEL[usuario.rol] || ""}</div>
        </div>
        <div class="avatar-badge">${inicial}</div>
      </div>
    `;
    const bellBtn = document.getElementById("notif-bell-btn");
    const panel = document.getElementById("notif-panel");
    bellBtn.addEventListener("click", (e) => { e.stopPropagation(); panel.classList.toggle("show"); });
    document.addEventListener("click", (e) => { if (!panel.contains(e.target) && e.target !== bellBtn) panel.classList.remove("show"); });

    // Estado del archivo de base de datos (visible solo para CIST), si js/filedb.js está cargado en esta página
    const pillDB = document.getElementById("db-status-pill");
    if (pillDB && typeof intentarReconectarArchivoBD === "function") {
      const textoDB = document.getElementById("db-status-texto");
      const esBaseDatosPage = location.pathname.endsWith("basededatos.html");
      intentarReconectarArchivoBD().then((r) => {
        if (r.estado === "conectado") { pillDB.classList.add("db-connected"); textoDB.textContent = "Guardando en archivo"; }
        else if (r.estado === "requiere-permiso") { pillDB.classList.add("db-warning"); textoDB.textContent = "Reconectar archivo"; pillDB.dataset.handleReconectar = "1"; pillDB._handlePendiente = r.handle; }
        else { textoDB.textContent = "Base de datos"; }
      });
      pillDB.addEventListener("click", async () => {
        if (pillDB.dataset.handleReconectar === "1" && pillDB._handlePendiente) {
          const r = await confirmarPermisoArchivoBD(pillDB._handlePendiente);
          if (r.ok) { pillDB.classList.remove("db-warning"); pillDB.classList.add("db-connected"); textoDB.textContent = "Guardando en archivo"; delete pillDB.dataset.handleReconectar; }
          return;
        }
        if (!esBaseDatosPage) window.location.href = "basededatos.html";
      });
    } else if (typeof intentarReconectarArchivoBD === "function") {
      // Otros roles no ven el indicador, pero si el CIST ya vinculó un archivo con permiso concedido,
      // sus acciones también deben quedar guardadas ahí en segundo plano.
      intentarReconectarArchivoBD();
    }
  }

  // Fondo oscuro + cierre del menú lateral en móvil
  if (sidebar && !document.querySelector(".sidebar-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.addEventListener("click", () => document.body.classList.remove("sidebar-open"));
    document.body.appendChild(backdrop);
  }

  // Sincronización con la nube en segundo plano: si hay datos más recientes guardados
  // por otra persona desde otro dispositivo, se lo avisamos sin interrumpir lo que esté haciendo.
  if (typeof sincronizarDesdeNube === "function") {
    sincronizarDesdeNube().then(r => { if (r.ok && r.cambios) mostrarBannerNube(); });
  }

  return usuario;
}

function mostrarBannerNube() {
  if (document.getElementById("cloud-banner")) return;
  const banner = document.createElement("div");
  banner.id = "cloud-banner";
  banner.className = "cloud-banner";
  banner.innerHTML = `
    <i class="bi bi-cloud-arrow-down"></i>
    <span>Hay datos más recientes guardados en la nube por otra persona.</span>
    <button type="button" onclick="window.location.reload()">Recargar ahora</button>
    <button type="button" class="cloud-banner-close" onclick="this.parentElement.remove()"><i class="bi bi-x-lg"></i></button>
  `;
  document.body.prepend(banner);
}

/* ---------- Toasts ---------- */
function mostrarToast(mensaje, tipo) {
  tipo = tipo || "success";
  let contenedor = document.getElementById("toast-stack");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toast-stack";
    contenedor.className = "toast-stack";
    document.body.appendChild(contenedor);
  }
  const iconos = { success: "bi-check-circle-fill", danger: "bi-exclamation-octagon-fill", info: "bi-info-circle-fill", warning: "bi-exclamation-triangle-fill" };
  const el = document.createElement("div");
  el.className = `toast-item toast-${tipo}`;
  el.innerHTML = `<i class="bi ${iconos[tipo] || iconos.success}"></i><span>${mensaje}</span>`;
  contenedor.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3600);
}

/* ---------- Utilidades de formato ---------- */
function formatoFecha(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${meses[Number(m) - 1]} ${y}`;
}

function chipNivel(nivelId) {
  const n = getNivelMinedu(nivelId);
  return `<span class="chip" style="--chip-color:${n.color}">${n.nombre}</span>`;
}

function iniciales(nombre) {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}
