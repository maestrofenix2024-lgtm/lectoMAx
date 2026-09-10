/**
 * LectorIEP — Capa de datos
 * IEP N.° 20150 "Mariscal Benavides" — UGEL 08 Cañete
 * Persistencia local (localStorage) simulando un backend real.
 */

const DB_PREFIX = "lectoriep_";
const DB_VERSION = "2.0.0";

const NIVELES_MINEDU = [
  { id: "inicio", nombre: "Inicio", color: "#A63A3A", minPuntaje: 0 },
  { id: "proceso", nombre: "Proceso", color: "#C77D2E", minPuntaje: 51 },
  { id: "logro_esperado", nombre: "Logro Esperado", color: "#3E6B4F", minPuntaje: 71 },
  { id: "logro_destacado", nombre: "Logro Destacado", color: "#1B3A5C", minPuntaje: 91 }
];

const NIVELES_LECTOR = [
  { min: 0, nombre: "Explorador de Páginas", icono: "bi-book" },
  { min: 200, nombre: "Aventurero Literario", icono: "bi-map" },
  { min: 600, nombre: "Sabio Lector", icono: "bi-mortarboard" },
  { min: 1500, nombre: "Leyenda de la Biblioteca", icono: "bi-award" }
];

const INSIGNIAS = [
  { id: "primer_libro", nombre: "Primer Libro", descripcion: "Completó su primera lectura", icono: "bi-bookmark-star", color: "#C77D2E" },
  { id: "racha_7", nombre: "Racha de Fuego", descripcion: "7 días seguidos registrando lectura", icono: "bi-fire", color: "#A63A3A" },
  { id: "racha_30", nombre: "Constancia de Oro", descripcion: "30 días seguidos registrando lectura", icono: "bi-trophy", color: "#C9A227" },
  { id: "devorador", nombre: "Devorador de Libros", descripcion: "10 libros completados", icono: "bi-collection", color: "#1B3A5C" },
  { id: "comprension_alta", nombre: "Maestro de la Comprensión", descripcion: "5 evaluaciones en Logro Destacado", icono: "bi-lightbulb", color: "#3E6B4F" },
  { id: "prestamo_responsable", nombre: "Lector Responsable", descripcion: "10 préstamos devueltos a tiempo", icono: "bi-clock-history", color: "#1B3A5C" },
  { id: "critico", nombre: "Crítico Literario", descripcion: "Escribió 5 reseñas de libros", icono: "bi-chat-quote", color: "#C77D2E" },
  { id: "meta_mensual", nombre: "Meta Cumplida", descripcion: "Cumplió su meta mensual de lectura", icono: "bi-flag", color: "#3E6B4F" }
];

const GENEROS = ["Cuento", "Novela", "Fábula", "Poesía", "Mito y Leyenda", "Ciencia Ficción", "Historia", "Aventura", "Biografía", "Cómic"];

/**
 * Niveles educativos del colegio (Primaria y Secundaria — Educación Básica Regular).
 * Se usan para diferenciar aulas, estudiantes y el catálogo de libros por nivel,
 * ya que ambos comparten los mismos números de grado (1° a 5°/6°) pero son grupos distintos.
 */
const NIVELES_EDUCATIVOS = [
  { id: "primaria", nombre: "Primaria", prefijo: "P", grados: [1, 2, 3, 4, 5, 6] },
  { id: "secundaria", nombre: "Secundaria", prefijo: "S", grados: [1, 2, 3, 4, 5] }
];

function getNivelEducativo(id) {
  return NIVELES_EDUCATIVOS.find(n => n.id === id) || NIVELES_EDUCATIVOS[1];
}

function gradosDeNivel(nivelId) {
  return getNivelEducativo(nivelId).grados;
}

/** Código corto único de grado+nivel, usado como parte del id de aula y en libros.grados. Ej: "P1", "S3". */
function codigoGrado(nivelId, grado) {
  return getNivelEducativo(nivelId).prefijo + grado;
}

/** Texto legible de un nivel+grado. Ej: "Primaria 1°". */
function etiquetaGrado(nivelId, grado) {
  return `${getNivelEducativo(nivelId).nombre} ${grado}°`;
}

/** Texto legible de un aula completa. Ej: Primaria 1° "A". */
function etiquetaAula(aula) {
  return `${etiquetaGrado(aula.nivel, aula.grado)} "${aula.seccion}"`;
}

/** Decodifica un código como "P3" o "S1" (usado en libros.grados) a texto legible. */
function etiquetaGradoPorCodigo(codigo) {
  const nivel = NIVELES_EDUCATIVOS.find(n => codigo.startsWith(n.prefijo));
  if (!nivel) return codigo;
  return etiquetaGrado(nivel.id, codigo.slice(nivel.prefijo.length));
}

/**
 * Catálogo de todos los módulos (páginas) del sistema. Se usa para:
 *  - armar el menú lateral de cada usuario según sus permisos (usuario.modulosPermitidos)
 *  - ofrecer valores por defecto razonables al crear una cuenta nueva desde Configuración
 */
const MODULOS_POR_ROL_DEFECTO = {
  admin: ["admin.html", "configuracion.html", "docente.html", "biblioteca.html", "prestamos.html", "premios.html", "reportes.html", "ranking.html", "basededatos.html", "perfil.html"],
  docente: ["docente.html", "biblioteca.html", "reportes.html", "ranking.html", "perfil.html"],
  bibliotecario: ["biblioteca.html", "prestamos.html", "premios.html", "reportes.html", "perfil.html"],
  estudiante: ["estudiante.html", "bitacora.html", "biblioteca.html", "evaluaciones.html", "ranking.html", "premios.html", "perfil.html"],
  padre: ["padre.html", "reportes.html", "perfil.html"]
};

function modulosPorDefecto(rol) {
  return (MODULOS_POR_ROL_DEFECTO[rol] || ["perfil.html"]).slice();
}

/** ¿Este usuario tiene acceso al módulo (archivo .html) indicado? */
function usuarioTieneModulo(usuario, href) {
  return !!usuario && Array.isArray(usuario.modulosPermitidos) && usuario.modulosPermitidos.includes(href);
}

/**
 * Única cuenta con la que arranca el sistema: el administrador (CIST) inicial.
 * Desde su panel de Configuración se registra a todo el demás personal y estudiantado —
 * el sistema NO trae datos de ejemplo de libros, aulas, estudiantes ni préstamos.
 */
function seedUsers() {
  return [
    {
      id: "u-admin-inicial", nombre: "Administrador CIST", rol: "admin",
      cargo: "Coordinador de Innovación y Soporte Tecnológico (CIST)",
      email: "admin", password: "admin123", avatar: "AD",
      puntos: 0, racha: 0, ultimaLectura: null,
      modulosPermitidos: modulosPorDefecto("admin")
    }
  ];
}

function fechaHace(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

/* ---------- Configuración general del sistema ---------- */

const DIAS_GRACIA_ALERTA = 7; // días de margen tras el inicio de accesos antes de marcar "en riesgo"

/** Config global de una sola entrada (no es una colección tipo array como las demás). */
function obtenerConfiguracion() {
  const raw = localStorage.getItem(dbKey("configuracion"));
  if (raw === null) {
    const base = { fechaInicioAccesos: null };
    localStorage.setItem(dbKey("configuracion"), JSON.stringify(base));
    return base;
  }
  try { return JSON.parse(raw); } catch (e) { return { fechaInicioAccesos: null }; }
}

function guardarConfiguracion(cambios) {
  const actual = obtenerConfiguracion();
  const nueva = { ...actual, ...cambios };
  localStorage.setItem(dbKey("configuracion"), JSON.stringify(nueva));
  _notifyDbChange("configuracion");
  return nueva;
}

/**
 * Determina si ya corresponde evaluar alertas de inactividad lectora.
 * Mientras no se defina una fecha de inicio de accesos, o esa fecha aún no llega,
 * nadie debe salir "en riesgo": el sistema simplemente no se ha activado para los estudiantes.
 */
function alertasActivas() {
  const cfg = obtenerConfiguracion();
  if (!cfg.fechaInicioAccesos) return false;
  const hoy = new Date().toISOString().slice(0, 10);
  return cfg.fechaInicioAccesos <= hoy;
}

/**
 * Fecha límite: un estudiante entra en alerta si su última lectura (o el inicio de accesos,
 * si nunca ha leído) es anterior a esta fecha.
 */
function fechaLimiteAlerta() {
  const cfg = obtenerConfiguracion();
  const inicio = cfg.fechaInicioAccesos;
  const hace7 = fechaHace(DIAS_GRACIA_ALERTA);
  // El límite nunca es antes del propio inicio de accesos + margen de gracia.
  return inicio && inicio > hace7 ? inicio : hace7;
}

/** ¿Este estudiante debe mostrarse "en riesgo" ahora mismo? */
function estudianteEnRiesgo(e) {
  if (!alertasActivas()) return false;
  const limite = fechaLimiteAlerta();
  return !e.ultimaLectura || e.ultimaLectura < limite;
}

function seedBooks() { return []; }
function seedLoans() { return []; }
function seedReadingLogs() { return []; }
function seedQuizzes() { return []; }
function seedQuizResults() { return []; }
function seedUserBadges() { return []; }
function seedClassrooms() { return []; }
function seedActivities() { return []; }
function seedAssignments() { return []; }

function seedRewards() { return []; }
function seedRedemptions() { return []; }

const SEED_MAP = {
  usuarios: seedUsers,
  libros: seedBooks,
  prestamos: seedLoans,
  bitacora: seedReadingLogs,
  quizzes: seedQuizzes,
  resultadosQuiz: seedQuizResults,
  insigniasUsuario: seedUserBadges,
  aulas: seedClassrooms,
  actividades: seedActivities,
  asignaciones: seedAssignments,
  premios: seedRewards,
  canjes: seedRedemptions
};


function dbKey(name) { return DB_PREFIX + name; }

/* Suscriptores que quieren enterarse cada vez que se escribe algo en la base de datos
   (usado por js/filedb.js para mantener sincronizado un archivo físico en disco). */
const _dbChangeHandlers = [];
function onDbChange(handler) { _dbChangeHandlers.push(handler); }
function _notifyDbChange(name) { _dbChangeHandlers.forEach(fn => { try { fn(name); } catch (e) { /* silencioso */ } }); }

function dbGet(name) {
  const raw = localStorage.getItem(dbKey(name));
  if (raw === null) {
    const seed = SEED_MAP[name] ? SEED_MAP[name]() : [];
    localStorage.setItem(dbKey(name), JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw); } catch (e) { return []; }
}

function dbSet(name, value) {
  localStorage.setItem(dbKey(name), JSON.stringify(value));
  _notifyDbChange(name);
}

function initDatabase() {
  const installedVersion = localStorage.getItem(dbKey("version"));
  if (installedVersion !== DB_VERSION) {
    Object.keys(SEED_MAP).forEach(name => {
      if (localStorage.getItem(dbKey(name)) === null) {
        dbSet(name, SEED_MAP[name]());
      }
    });
    localStorage.setItem(dbKey("version"), DB_VERSION);
  }
  migrarAulasADocentesMultiples();
}

function resetDatabase() {
  Object.keys(SEED_MAP).forEach(name => dbSet(name, SEED_MAP[name]()));
  localStorage.setItem(dbKey("version"), DB_VERSION);
}

/* ---------- Archivo de base de datos (respaldo / restauración completa) ---------- */

const COLECCIONES_BD = Object.keys(SEED_MAP);

function tamanoBaseDatosKB() {
  let total = 0;
  COLECCIONES_BD.forEach(name => { total += (localStorage.getItem(dbKey(name)) || "").length; });
  return Math.round((total / 1024) * 10) / 10;
}

function totalRegistrosBaseDatos() {
  return COLECCIONES_BD.reduce((acc, name) => acc + dbGet(name).length, 0);
}

/** Exporta TODA la base de datos (todas las colecciones) a un objeto serializable. */
function exportarTodo() {
  const data = {};
  COLECCIONES_BD.forEach(name => { data[name] = dbGet(name); });
  return {
    sistema: "LectorIEP", version: DB_VERSION,
    exportadoEl: new Date().toISOString(),
    colegio: "IEP N.° 20150 Mariscal Benavides",
    configuracion: obtenerConfiguracion(),
    data
  };
}

/** Restaura la base de datos completa desde un objeto previamente exportado con exportarTodo(). */
function importarTodo(paquete) {
  if (!paquete || typeof paquete !== "object" || !paquete.data) {
    return { ok: false, mensaje: "El archivo no tiene el formato esperado de base de datos de LectorIEP." };
  }
  COLECCIONES_BD.forEach(name => {
    if (Array.isArray(paquete.data[name])) dbSet(name, paquete.data[name]);
  });
  if (paquete.configuracion && typeof paquete.configuracion === "object") {
    guardarConfiguracion(paquete.configuracion);
  }
  localStorage.setItem(dbKey("version"), DB_VERSION);
  return { ok: true };
}

/* ---------- Helpers de dominio ---------- */

function getUserById(id) {
  return dbGet("usuarios").find(u => u.id === id);
}

function getBookById(id) {
  return dbGet("libros").find(b => b.id === id);
}

function getNivelMinedu(id) {
  return NIVELES_MINEDU.find(n => n.id === id) || NIVELES_MINEDU[0];
}

function getNivelLector(puntos) {
  let actual = NIVELES_LECTOR[0];
  for (const n of NIVELES_LECTOR) { if (puntos >= n.min) actual = n; }
  return actual;
}

function getBadgeById(id) {
  return INSIGNIAS.find(b => b.id === id);
}

function librosLeidosPorUsuario(usuarioId) {
  const logs = dbGet("bitacora").filter(l => l.usuarioId === usuarioId);
  return new Set(logs.map(l => l.libroId)).size;
}

function minutosLeidosPorUsuario(usuarioId) {
  return dbGet("bitacora").filter(l => l.usuarioId === usuarioId).reduce((acc, l) => acc + (l.minutos || 0), 0);
}

function otorgarInsignia(usuarioId, badgeId) {
  const insignias = dbGet("insigniasUsuario");
  if (!insignias.some(i => i.usuarioId === usuarioId && i.badgeId === badgeId)) {
    insignias.push({ usuarioId, badgeId, fecha: new Date().toISOString().slice(0, 10) });
    dbSet("insigniasUsuario", insignias);
    return true;
  }
  return false;
}

function evaluarInsigniasAutomaticas(usuarioId) {
  const nuevas = [];
  const libros = librosLeidosPorUsuario(usuarioId);
  const usuario = getUserById(usuarioId);
  if (libros >= 1 && otorgarInsignia(usuarioId, "primer_libro")) nuevas.push("primer_libro");
  if (libros >= 10 && otorgarInsignia(usuarioId, "devorador")) nuevas.push("devorador");
  if (usuario && usuario.racha >= 7 && otorgarInsignia(usuarioId, "racha_7")) nuevas.push("racha_7");
  if (usuario && usuario.racha >= 30 && otorgarInsignia(usuarioId, "racha_30")) nuevas.push("racha_30");
  const resultadosAltos = dbGet("resultadosQuiz").filter(r => r.usuarioId === usuarioId && r.nivel === "logro_destacado").length;
  if (resultadosAltos >= 5 && otorgarInsignia(usuarioId, "comprension_alta")) nuevas.push("comprension_alta");
  return nuevas;
}

function actualizarRachaLectura(usuario) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (usuario.ultimaLectura === hoy) return usuario.racha;
  const ayer = fechaHace(1);
  usuario.racha = usuario.ultimaLectura === ayer ? usuario.racha + 1 : 1;
  usuario.ultimaLectura = hoy;
  return usuario.racha;
}

function registrarLectura({ usuarioId, libroId, paginas, minutos, autoevaluacion, comentario }) {
  const bitacora = dbGet("bitacora");
  const id = "r" + Date.now();
  const puntosGanados = Math.round(Number(paginas) * 2 + Number(minutos) * 0.5);
  bitacora.push({ id, usuarioId, libroId, fecha: new Date().toISOString().slice(0, 10), paginas: Number(paginas), minutos: Number(minutos), autoevaluacion: Number(autoevaluacion), comentario: comentario || "", puntos: puntosGanados });
  dbSet("bitacora", bitacora);

  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === usuarioId);
  usuario.puntos = (usuario.puntos || 0) + puntosGanados;
  actualizarRachaLectura(usuario);
  dbSet("usuarios", usuarios);

  const nuevasInsignias = evaluarInsigniasAutomaticas(usuarioId);
  return { puntosGanados, nuevasInsignias, racha: usuario.racha };
}

function editarRegistroLectura(id, { libroId, paginas, minutos, autoevaluacion, comentario }) {
  const bitacora = dbGet("bitacora");
  const registro = bitacora.find(r => r.id === id);
  if (!registro) return false;
  const puntosAnteriores = registro.puntos || 0;
  const puntosNuevos = Math.round(Number(paginas) * 2 + Number(minutos) * 0.5);
  registro.libroId = libroId; registro.paginas = Number(paginas); registro.minutos = Number(minutos);
  registro.autoevaluacion = Number(autoevaluacion); registro.comentario = comentario || ""; registro.puntos = puntosNuevos;
  dbSet("bitacora", bitacora);

  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === registro.usuarioId);
  if (usuario) { usuario.puntos = Math.max(0, (usuario.puntos || 0) - puntosAnteriores + puntosNuevos); dbSet("usuarios", usuarios); }
  return true;
}

function eliminarRegistroLectura(id) {
  const bitacora = dbGet("bitacora");
  const registro = bitacora.find(r => r.id === id);
  if (!registro) return false;
  dbSet("bitacora", bitacora.filter(r => r.id !== id));

  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === registro.usuarioId);
  if (usuario) { usuario.puntos = Math.max(0, (usuario.puntos || 0) - (registro.puntos || 0)); dbSet("usuarios", usuarios); }
  return true;
}

const LIMITE_PRESTAMOS_ACTIVOS = 3;
const DIAS_HABILES_DEVOLUCION = 2;

function sumarDiasHabiles(fechaBase, cantidadDiasHabiles) {
  const fecha = new Date(fechaBase);
  let agregados = 0;
  while (agregados < cantidadDiasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const diaSemana = fecha.getDay(); // 0 = domingo, 6 = sábado
    if (diaSemana !== 0 && diaSemana !== 6) agregados++;
  }
  return fecha;
}

function prestamosActivosDeUsuario(usuarioId) {
  return dbGet("prestamos").filter(p => p.usuarioId === usuarioId && (p.estado === "vigente" || p.estado === "atrasado"));
}

function prestamoActivoDeUsuario(usuarioId) {
  return prestamosActivosDeUsuario(usuarioId)[0] || null;
}

function usuarioSancionado(usuarioId) {
  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario || !usuario.sancionHasta) return null;
  const hoy = new Date().toISOString().slice(0, 10);
  if (usuario.sancionHasta < hoy) return null;
  return usuario.sancionHasta;
}

function registrarPrestamo({ libroId, usuarioId }) {
  const sancionHasta = usuarioSancionado(usuarioId);
  if (sancionHasta) {
    return { ok: false, mensaje: `Tienes una sanción por devolución tardía activa hasta el ${sancionHasta}. No puedes pedir libros hasta entonces.` };
  }

  const activos = prestamosActivosDeUsuario(usuarioId);
  if (activos.length >= LIMITE_PRESTAMOS_ACTIVOS) {
    return { ok: false, mensaje: `Ya tienes ${LIMITE_PRESTAMOS_ACTIVOS} libros prestados. Debes devolver alguno antes de pedir otro.` };
  }

  const libros = dbGet("libros");
  const libro = libros.find(b => b.id === libroId);
  if (!libro || libro.disponibles <= 0) return { ok: false, mensaje: "No hay ejemplares disponibles." };

  const librosActivos = activos.map(p => libros.find(b => b.id === p.libroId)).filter(Boolean);
  if (librosActivos.some(b => b.autor === libro.autor)) {
    return { ok: false, mensaje: `Ya tienes un libro prestado del mismo autor (${libro.autor}). Elige uno de un autor distinto.` };
  }
  if (librosActivos.some(b => b.genero === libro.genero)) {
    return { ok: false, mensaje: `Ya tienes un libro prestado del mismo género (${libro.genero}). Elige uno de un género distinto.` };
  }

  libro.disponibles -= 1;
  dbSet("libros", libros);

  const prestamos = dbGet("prestamos");
  const hoy = new Date();
  const devolucion = sumarDiasHabiles(hoy, DIAS_HABILES_DEVOLUCION);
  prestamos.push({
    id: "p" + Date.now(), libroId, usuarioId,
    fechaPrestamo: hoy.toISOString().slice(0, 10),
    fechaDevolucionEsperada: devolucion.toISOString().slice(0, 10),
    fechaDevolucionReal: null, estado: "vigente", diasAtraso: 0
  });
  dbSet("prestamos", prestamos);
  return { ok: true };
}

function registrarDevolucion(prestamoId) {
  const prestamos = dbGet("prestamos");
  const prestamo = prestamos.find(p => p.id === prestamoId);
  if (!prestamo) return false;
  const hoyStr = new Date().toISOString().slice(0, 10);
  prestamo.fechaDevolucionReal = hoyStr;
  prestamo.estado = "devuelto";

  let diasAtraso = 0;
  if (hoyStr > prestamo.fechaDevolucionEsperada) {
    const msPorDia = 1000 * 60 * 60 * 24;
    diasAtraso = Math.round((new Date(hoyStr) - new Date(prestamo.fechaDevolucionEsperada)) / msPorDia);
  }
  prestamo.diasAtraso = diasAtraso;
  dbSet("prestamos", prestamos);

  const libros = dbGet("libros");
  const libro = libros.find(b => b.id === prestamo.libroId);
  if (libro) { libro.disponibles = Math.min(libro.stock, libro.disponibles + 1); dbSet("libros", libros); }

  if (diasAtraso > 0) {
    const usuarios = dbGet("usuarios");
    const usuario = usuarios.find(u => u.id === prestamo.usuarioId);
    if (usuario) {
      const sancionHasta = new Date();
      sancionHasta.setDate(sancionHasta.getDate() + diasAtraso);
      usuario.sancionHasta = sancionHasta.toISOString().slice(0, 10);
      usuario.sancionesTotal = (usuario.sancionesTotal || 0) + 1;
      dbSet("usuarios", usuarios);
    }
  }
  return true;
}

function actualizarEstadosPrestamos() {
  const prestamos = dbGet("prestamos");
  const hoy = new Date().toISOString().slice(0, 10);
  let cambios = false;
  prestamos.forEach(p => {
    if (p.estado === "vigente" && p.fechaDevolucionEsperada < hoy) { p.estado = "atrasado"; cambios = true; }
  });
  if (cambios) dbSet("prestamos", prestamos);
}

function editarPrestamo(id, { fechaDevolucionEsperada }) {
  const prestamos = dbGet("prestamos");
  const prestamo = prestamos.find(p => p.id === id);
  if (!prestamo) return false;
  prestamo.fechaDevolucionEsperada = fechaDevolucionEsperada;
  if (prestamo.estado === "atrasado" && fechaDevolucionEsperada >= new Date().toISOString().slice(0, 10)) prestamo.estado = "vigente";
  dbSet("prestamos", prestamos);
  return true;
}

function eliminarPrestamo(id) {
  const prestamos = dbGet("prestamos");
  const prestamo = prestamos.find(p => p.id === id);
  if (!prestamo) return false;
  if (prestamo.estado !== "devuelto") {
    const libros = dbGet("libros");
    const libro = libros.find(b => b.id === prestamo.libroId);
    if (libro) { libro.disponibles = Math.min(libro.stock, libro.disponibles + 1); dbSet("libros", libros); }
  }
  dbSet("prestamos", prestamos.filter(p => p.id !== id));
  return true;
}

function calificarQuiz(quiz, respuestas) {
  let correctas = 0;
  quiz.preguntas.forEach((p, i) => { if (respuestas[i] === p.correcta) correctas++; });
  const puntaje = Math.round((correctas / quiz.preguntas.length) * 100);
  const nivel = NIVELES_MINEDU.slice().reverse().find(n => puntaje >= n.minPuntaje).id;
  return { correctas, total: quiz.preguntas.length, puntaje, nivel };
}

function guardarResultadoQuiz({ usuarioId, quizId, puntaje, nivel }) {
  const resultados = dbGet("resultadosQuiz");
  resultados.push({ id: "qr" + Date.now(), usuarioId, quizId, puntaje, nivel, fecha: new Date().toISOString().slice(0, 10) });
  dbSet("resultadosQuiz", resultados);
  evaluarInsigniasAutomaticas(usuarioId);
}

/* ---------- Libros: alta / edición / baja ---------- */

function libroActivo(libro) { return libro.activo !== false; }

function actualizarLibro(id, cambios) {
  const libros = dbGet("libros");
  const libro = libros.find(b => b.id === id);
  if (!libro) return false;
  Object.assign(libro, cambios);
  dbSet("libros", libros);
  return true;
}

function alternarBajaLibro(id) {
  const libros = dbGet("libros");
  const libro = libros.find(b => b.id === id);
  if (!libro) return false;
  libro.activo = !libroActivo(libro);
  dbSet("libros", libros);
  return libro.activo;
}

/* ---------- Metas personales de lectura ---------- */

function metaPersonalDe(usuario) { return usuario.metaPersonalLibros || 4; }

function librosLeidosEsteMes(usuarioId) {
  const inicioMes = new Date().toISOString().slice(0, 7);
  const logs = dbGet("bitacora").filter(l => l.usuarioId === usuarioId && l.fecha.startsWith(inicioMes));
  return new Set(logs.map(l => l.libroId)).size;
}

function actualizarMetaPersonal(usuarioId, meta) {
  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario) return false;
  usuario.metaPersonalLibros = Math.max(1, Number(meta));
  dbSet("usuarios", usuarios);
  return true;
}

/* ---------- Asignaciones de lectura (docente → aula) ---------- */

function crearAsignacion({ aulaId, libroId, docenteId, fechaLimite, nota }) {
  const asignaciones = dbGet("asignaciones");
  asignaciones.push({ id: "asig" + Date.now(), aulaId, libroId, docenteId, fechaLimite, nota: nota || "" });
  dbSet("asignaciones", asignaciones);
}

function editarAsignacion(id, { libroId, fechaLimite, nota }) {
  const asignaciones = dbGet("asignaciones");
  const asig = asignaciones.find(a => a.id === id);
  if (!asig) return false;
  asig.libroId = libroId; asig.fechaLimite = fechaLimite; asig.nota = nota || "";
  dbSet("asignaciones", asignaciones);
  return true;
}

function eliminarAsignacion(id) {
  dbSet("asignaciones", dbGet("asignaciones").filter(a => a.id !== id));
}

function asignacionesDeAula(aulaId) {
  return dbGet("asignaciones").filter(a => a.aulaId === aulaId);
}

function asignacionesDeEstudiante(usuario) {
  if (!usuario.grado || !usuario.seccion) return [];
  const aula = dbGet("aulas").find(a => a.nivel === usuario.nivel && a.grado === usuario.grado && a.seccion === usuario.seccion);
  if (!aula) return [];
  const leidos = new Set(dbGet("bitacora").filter(l => l.usuarioId === usuario.id).map(l => l.libroId));
  return asignacionesDeAula(aula.id).map(a => ({ ...a, cumplida: leidos.has(a.libroId) }));
}

/* ---------- Alta de aulas y usuarios (panel CIST) ---------- */

/** Normaliza cualquier entrada de docentes (array, id suelto, o vacío) a un array de ids sin duplicados. */
function normalizarDocenteIds(docenteIds) {
  const lista = Array.isArray(docenteIds) ? docenteIds : (docenteIds ? [docenteIds] : []);
  return [...new Set(lista.filter(Boolean))];
}

/** Devuelve los usuarios (docentes) asignados a un aula, ya resueltos desde sus ids. */
function docentesDeAula(aula) {
  return normalizarDocenteIds(aula.docenteIds).map(id => getUserById(id)).filter(Boolean);
}

function crearAula({ nivel, grado, seccion, docenteIds, metaMensualLibros }) {
  const aulas = dbGet("aulas");
  const id = codigoGrado(nivel, grado) + seccion;
  if (aulas.some(a => a.id === id)) return { ok: false, mensaje: "Ya existe un aula con ese nivel, grado y sección." };
  aulas.push({ id, nivel, grado, seccion, docenteIds: normalizarDocenteIds(docenteIds), metaMensualLibros: Number(metaMensualLibros) || 2 });
  dbSet("aulas", aulas);
  return { ok: true };
}

function actualizarAula(id, { docenteIds, metaMensualLibros }) {
  const aulas = dbGet("aulas");
  const aula = aulas.find(a => a.id === id);
  if (!aula) return false;
  if (docenteIds !== undefined) aula.docenteIds = normalizarDocenteIds(docenteIds);
  aula.metaMensualLibros = Number(metaMensualLibros) || aula.metaMensualLibros;
  dbSet("aulas", aulas);
  return true;
}

/** Migra aulas antiguas con un solo `docenteId` al nuevo formato `docenteIds` (array). Segura de correr varias veces. */
function migrarAulasADocentesMultiples() {
  const aulas = dbGet("aulas");
  let cambiado = false;
  aulas.forEach(a => {
    if (!Array.isArray(a.docenteIds)) {
      a.docenteIds = a.docenteId ? [a.docenteId] : [];
      cambiado = true;
    }
    if (a.docenteId !== undefined) { delete a.docenteId; cambiado = true; }
  });
  if (cambiado) dbSet("aulas", aulas);
}

function eliminarAula(id) {
  const tieneEstudiantes = dbGet("usuarios").some(u => u.rol === "estudiante" && usuarioActivo(u) && `${codigoGrado(u.nivel, u.grado)}${u.seccion}` === id);
  if (tieneEstudiantes) return { ok: false, mensaje: "No se puede eliminar: el aula tiene estudiantes activos." };
  dbSet("aulas", dbGet("aulas").filter(a => a.id !== id));
  dbSet("asignaciones", dbGet("asignaciones").filter(a => a.aulaId !== id));
  return { ok: true };
}

function crearUsuario(datos) {
  const usuarios = dbGet("usuarios");
  if (usuarios.some(u => u.email.toLowerCase() === datos.email.toLowerCase())) {
    return { ok: false, mensaje: "Ya existe un usuario con ese correo." };
  }
  const base = {
    id: "u" + Date.now() + Math.floor(Math.random() * 1000),
    puntos: 0, racha: 0, ultimaLectura: null
  };
  let modulosPermitidos = Array.isArray(datos.modulosPermitidos) && datos.modulosPermitidos.length
    ? datos.modulosPermitidos.slice()
    : modulosPorDefecto(datos.rol);
  if (!modulosPermitidos.includes("perfil.html")) modulosPermitidos.push("perfil.html");
  usuarios.push({ ...base, ...datos, modulosPermitidos, avatar: datos.avatar || iniciales2(datos.nombre) });
  dbSet("usuarios", usuarios);
  return { ok: true };
}

function actualizarUsuario(id, cambios) {
  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return { ok: false, mensaje: "Usuario no encontrado." };
  if (cambios.email && usuarios.some(u => u.id !== id && u.email.toLowerCase() === cambios.email.toLowerCase())) {
    return { ok: false, mensaje: "Ese correo ya está en uso por otro usuario." };
  }
  if (Array.isArray(cambios.modulosPermitidos) && !cambios.modulosPermitidos.includes("perfil.html")) {
    cambios.modulosPermitidos.push("perfil.html");
  }
  Object.assign(usuario, cambios);
  dbSet("usuarios", usuarios);
  return { ok: true };
}

function iniciales2(nombre) {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

/* ---------- Gestión de estudiantes por aula (uso docente) ---------- */

function usuarioActivo(u) { return u.activo !== false; }

function alternarBajaUsuario(usuarioId) {
  const usuarios = dbGet("usuarios");
  const u = usuarios.find(x => x.id === usuarioId);
  if (!u) return null;
  u.activo = !usuarioActivo(u);
  dbSet("usuarios", usuarios);
  return u.activo;
}

function reasignarAulaEstudiante(usuarioId, nivel, grado, seccion) {
  const usuarios = dbGet("usuarios");
  const u = usuarios.find(x => x.id === usuarioId && x.rol === "estudiante");
  if (!u) return false;
  u.nivel = nivel; u.grado = grado; u.seccion = seccion;
  dbSet("usuarios", usuarios);
  return true;
}

/**
 * Importación masiva de estudiantes desde una plantilla (array de filas ya parseadas).
 * Cada fila esperada: { Nombre, Correo, Aula, Contraseña }  (Aula en formato "Grado-Sección", ej. "1-A")
 * Solo crea estudiantes en aulas que existan y pertenezcan a `aulasPermitidas` (ids de aula).
 */
function parsearNivelTexto(texto) {
  const t = (texto || "").toString().trim().toLowerCase();
  if (t.startsWith("prim") || t === "p") return "primaria";
  if (t.startsWith("secu") || t === "s") return "secundaria";
  return null;
}

function importarEstudiantesMasivo(filas, aulasPermitidas) {
  const resumen = { creados: 0, omitidos: 0, errores: [] };
  const aulas = dbGet("aulas");
  filas.forEach((fila, idx) => {
    const nombre = (fila.Nombre || fila.nombre || "").toString().trim();
    const correo = (fila.Correo || fila.correo || fila.Email || fila.email || "").toString().trim();
    const aulaTxt = (fila.Aula || fila.aula || "").toString().trim();
    const password = (fila["Contraseña"] || fila.password || fila.Password || "").toString().trim() || "lector123";

    if (!nombre || !correo || !aulaTxt) { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: faltan datos obligatorios.`); return; }
    const partes = aulaTxt.split("-").map(s => s.trim());
    const nivel = partes.length >= 3 ? parsearNivelTexto(partes[0]) : null;
    const grado = partes.length >= 3 ? partes[1] : partes[0];
    const seccion = partes.length >= 3 ? partes[2] : partes[1];
    if (!nivel || !grado || !seccion) { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: formato de aula inválido ("${aulaTxt}"), usa Nivel-Grado-Sección, ej. Secundaria-3-A.`); return; }
    const aula = aulas.find(a => a.nivel === nivel && a.grado === grado && a.seccion === seccion);
    if (!aula || (aulasPermitidas && !aulasPermitidas.includes(aula.id))) {
      resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: el aula "${aulaTxt}" no existe o no está a tu cargo.`); return;
    }
    const resultado = crearUsuario({ nombre, email: correo, password, rol: "estudiante", nivel, grado, seccion });
    if (resultado.ok) resumen.creados++;
    else { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: ${resultado.mensaje}`); }
  });
  return resumen;
}

/**
 * Importación masiva UNIVERSAL (cualquier rol) para el módulo de Configuración.
 * Cada fila esperada: { Nombre, Correo, Rol, Aula, Cargo, Contraseña }
 *  - Rol: admin | docente | bibliotecario | estudiante | padre
 *  - Aula: solo para estudiantes, formato "Nivel-Grado-Sección" (ej. "Secundaria-3-A" o "Primaria-1-B").
 *    Si el aula no existe, se crea automáticamente (sin docente asignado).
 *  - Cargo: solo para docente/bibliotecario (texto libre, ej. "Docente de Comunicación").
 */
function importarUsuariosMasivo(filas) {
  const resumen = { creados: 0, omitidos: 0, errores: [] };
  const rolesValidos = ["admin", "docente", "bibliotecario", "estudiante", "padre"];
  filas.forEach((fila, idx) => {
    const nombre = (fila.Nombre || fila.nombre || "").toString().trim();
    const correo = (fila.Correo || fila.correo || fila.Email || fila.email || "").toString().trim();
    const rol = (fila.Rol || fila.rol || "").toString().trim().toLowerCase();
    const aulaTxt = (fila.Aula || fila.aula || "").toString().trim();
    const cargo = (fila.Cargo || fila.cargo || "").toString().trim();
    const password = (fila["Contraseña"] || fila.password || fila.Password || "").toString().trim() || "Lector123*";

    if (!nombre || !correo || !rol) { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: faltan datos obligatorios (Nombre, Correo o Rol).`); return; }
    if (!rolesValidos.includes(rol)) { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: el rol "${rol}" no es válido.`); return; }

    const datos = { nombre, email: correo, password, rol };
    if (rol === "estudiante") {
      if (!aulaTxt) { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: falta el aula para el estudiante.`); return; }
      const partes = aulaTxt.split("-").map(s => s.trim());
      const nivel = parsearNivelTexto(partes[0]);
      const grado = partes[1]; const seccion = partes[2];
      if (!nivel || !grado || !seccion) { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: formato de aula inválido ("${aulaTxt}"), usa Nivel-Grado-Sección, ej. Secundaria-3-A.`); return; }
      let aula = dbGet("aulas").find(a => a.nivel === nivel && a.grado === grado && a.seccion === seccion);
      if (!aula) crearAula({ nivel, grado, seccion, docenteIds: [], metaMensualLibros: 2 });
      datos.nivel = nivel; datos.grado = grado; datos.seccion = seccion;
    }
    if ((rol === "docente" || rol === "bibliotecario") && cargo) datos.cargo = cargo;

    const resultado = crearUsuario(datos);
    if (resultado.ok) resumen.creados++;
    else { resumen.omitidos++; resumen.errores.push(`Fila ${idx + 2}: ${resultado.mensaje}`); }
  });
  return resumen;
}

/* ---------- Notificaciones (calculadas, no persistidas) ---------- */

function generarNotificaciones(usuario) {
  const notifs = [];
  const hoy = new Date().toISOString().slice(0, 10);

  if (["admin", "docente", "bibliotecario"].includes(usuario.rol)) {
    const prestamos = dbGet("prestamos");
    const atrasados = prestamos.filter(p => p.estado === "atrasado" || (p.estado === "vigente" && p.fechaDevolucionEsperada < hoy));
    if (atrasados.length) notifs.push({ tipo: "warning", icono: "bi-clock-history", texto: `${atrasados.length} préstamo(s) atrasado(s) por devolver.` });

    let estudiantes = dbGet("usuarios").filter(u => u.rol === "estudiante");
    if (usuario.rol === "docente") {
      const misAulas = dbGet("aulas").filter(a => normalizarDocenteIds(a.docenteIds).includes(usuario.id));
      estudiantes = estudiantes.filter(e => misAulas.some(a => a.grado === e.grado && a.seccion === e.seccion));
    }
    const inactivos = estudiantes.filter(estudianteEnRiesgo);
    if (inactivos.length) notifs.push({ tipo: "info", icono: "bi-person-exclamation", texto: `${inactivos.length} estudiante(s) sin registrar lectura en ${DIAS_GRACIA_ALERTA}+ días.` });
  }

  if (usuario.rol === "estudiante") {
    const misPrestamos = dbGet("prestamos").filter(p => p.usuarioId === usuario.id && (p.estado === "atrasado" || (p.estado === "vigente" && p.fechaDevolucionEsperada < hoy)));
    if (misPrestamos.length) notifs.push({ tipo: "warning", icono: "bi-clock-history", texto: `Tienes ${misPrestamos.length} libro(s) por devolver.` });

    const pendientes = asignacionesDeEstudiante(usuario).filter(a => !a.cumplida && a.fechaLimite >= hoy);
    if (pendientes.length) notifs.push({ tipo: "info", icono: "bi-journal-bookmark", texto: `Tienes ${pendientes.length} lectura(s) asignada(s) por tu docente.` });
  }

  return notifs;
}

/* ---------- Actividades del plan lector (CRUD) ---------- */

function crearActividad({ titulo, fecha, descripcion, tipo }) {
  const actividades = dbGet("actividades");
  actividades.push({ id: "a" + Date.now(), titulo, fecha, descripcion: descripcion || "", tipo: tipo || "evento" });
  dbSet("actividades", actividades);
}

function actualizarActividad(id, { titulo, fecha, descripcion, tipo }) {
  const actividades = dbGet("actividades");
  const act = actividades.find(a => a.id === id);
  if (!act) return false;
  act.titulo = titulo; act.fecha = fecha; act.descripcion = descripcion || ""; act.tipo = tipo || "evento";
  dbSet("actividades", actividades);
  return true;
}

function eliminarActividad(id) {
  dbSet("actividades", dbGet("actividades").filter(a => a.id !== id));
}

/* ---------- Banco de evaluaciones / quizzes (CRUD) ---------- */

function crearQuiz({ libroId, titulo, preguntas }) {
  const quizzes = dbGet("quizzes");
  quizzes.push({ id: "q" + Date.now(), libroId, titulo, preguntas });
  dbSet("quizzes", quizzes);
}

function actualizarQuiz(id, { libroId, titulo, preguntas }) {
  const quizzes = dbGet("quizzes");
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) return false;
  quiz.libroId = libroId; quiz.titulo = titulo; quiz.preguntas = preguntas;
  dbSet("quizzes", quizzes);
  return true;
}

function eliminarQuiz(id) {
  dbSet("quizzes", dbGet("quizzes").filter(q => q.id !== id));
  dbSet("resultadosQuiz", dbGet("resultadosQuiz").filter(r => r.quizId !== id));
}

/* ---------- Reseñas y calificación de libros (a partir de la bitácora) ---------- */

function resenasDeLibro(libroId) {
  return dbGet("bitacora")
    .filter(l => l.libroId === libroId && l.comentario && l.comentario.trim())
    .map(l => ({ ...l, usuario: getUserById(l.usuarioId) }))
    .filter(l => l.usuario)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function promedioCalificacionLibro(libroId) {
  const registros = dbGet("bitacora").filter(l => l.libroId === libroId);
  if (registros.length === 0) return null;
  return registros.reduce((acc, l) => acc + l.autoevaluacion, 0) / registros.length;
}

function librosMasLeidos(top) {
  const conteo = {};
  dbGet("bitacora").forEach(l => { conteo[l.libroId] = (conteo[l.libroId] || 0) + 1; });
  return Object.entries(conteo)
    .map(([libroId, veces]) => ({ libro: getBookById(libroId), veces }))
    .filter(x => x.libro)
    .sort((a, b) => b.veces - a.veces)
    .slice(0, top || 5);
}

/* ---------- Premios / tienda de puntos (canje de recompensas) ---------- */

function crearPremio({ nombre, descripcion, costoPuntos, stock }) {
  const premios = dbGet("premios");
  premios.push({
    id: "pr" + Date.now(), nombre, descripcion: descripcion || "",
    costoPuntos: Number(costoPuntos), stock: stock === "" || stock === null || stock === undefined ? null : Number(stock),
    activo: true
  });
  dbSet("premios", premios);
}

function actualizarPremio(id, { nombre, descripcion, costoPuntos, stock }) {
  const premios = dbGet("premios");
  const premio = premios.find(p => p.id === id);
  if (!premio) return false;
  premio.nombre = nombre; premio.descripcion = descripcion || "";
  premio.costoPuntos = Number(costoPuntos);
  premio.stock = stock === "" || stock === null || stock === undefined ? null : Number(stock);
  dbSet("premios", premios);
  return true;
}

function alternarActivoPremio(id) {
  const premios = dbGet("premios");
  const premio = premios.find(p => p.id === id);
  if (!premio) return null;
  premio.activo = !premio.activo;
  dbSet("premios", premios);
  return premio.activo;
}

function eliminarPremio(id) {
  dbSet("premios", dbGet("premios").filter(p => p.id !== id));
  dbSet("canjes", dbGet("canjes").filter(c => c.premioId !== id));
}

function canjearPremio(usuarioId, premioId) {
  const premios = dbGet("premios");
  const premio = premios.find(p => p.id === premioId);
  if (!premio || !premio.activo) return { ok: false, mensaje: "Este premio ya no está disponible." };
  if (premio.stock !== null && premio.stock <= 0) return { ok: false, mensaje: "No quedan unidades de este premio." };

  const usuarios = dbGet("usuarios");
  const usuario = usuarios.find(u => u.id === usuarioId);
  if (!usuario || (usuario.puntos || 0) < premio.costoPuntos) return { ok: false, mensaje: "No tienes puntos suficientes para este premio." };

  usuario.puntos -= premio.costoPuntos;
  dbSet("usuarios", usuarios);

  if (premio.stock !== null) { premio.stock -= 1; dbSet("premios", premios); }

  const canjes = dbGet("canjes");
  canjes.push({ id: "cj" + Date.now(), usuarioId, premioId, fecha: new Date().toISOString().slice(0, 10), estado: "pendiente" });
  dbSet("canjes", canjes);
  return { ok: true, puntosRestantes: usuario.puntos };
}

function marcarCanjeEntregado(canjeId) {
  const canjes = dbGet("canjes");
  const canje = canjes.find(c => c.id === canjeId);
  if (!canje) return false;
  canje.estado = "entregado";
  dbSet("canjes", canjes);
  return true;
}
