/**
 * LectorIEP — Archivo de base de datos
 * Mantiene TODA la información del sistema respaldada en un archivo .json real,
 * además de localStorage (que sigue siendo la fuente de lectura/escritura rápida).
 *
 * Dos modos, según lo que soporte el navegador:
 *  - Guardado automático en archivo (Chrome/Edge/Opera): el usuario vincula un archivo
 *    una vez y cada cambio se escribe ahí solo, en segundo plano.
 *  - Respaldo manual (todos los navegadores): botones para descargar y restaurar
 *    un archivo .json con la base de datos completa.
 */

const FSA_DISPONIBLE = typeof window !== "undefined" && "showSaveFilePicker" in window;

let _manejadorArchivoBD = null;   // FileSystemFileHandle vinculado (dura mientras la pestaña esté abierta)
let _nombreArchivoBD = null;
let _guardadoPendiente = null;

function nombreArchivoSugerido() {
  return `lectoriep-basededatos-${new Date().toISOString().slice(0, 10)}.json`;
}

function estadoArchivoBD() {
  return { soportado: FSA_DISPONIBLE, vinculado: !!_manejadorArchivoBD, nombre: _nombreArchivoBD };
}

/* ---------- Persistencia del vínculo entre páginas (IndexedDB) ---------- */

const IDB_NOMBRE = "lectoriep_filedb";
const IDB_ALMACEN = "handles";

function _abrirIDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) { reject(new Error("IndexedDB no disponible")); return; }
    const req = indexedDB.open(IDB_NOMBRE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_ALMACEN);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function _guardarHandleIDB(handle) {
  try {
    const db = await _abrirIDB();
    await new Promise((resolve) => {
      const tx = db.transaction(IDB_ALMACEN, "readwrite");
      tx.objectStore(IDB_ALMACEN).put(handle, "archivoBD");
      tx.oncomplete = resolve; tx.onerror = resolve;
    });
  } catch (e) { /* seguimos sin persistencia entre páginas si el navegador no lo soporta */ }
}

async function _obtenerHandleIDB() {
  try {
    const db = await _abrirIDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_ALMACEN, "readonly");
      const req = tx.objectStore(IDB_ALMACEN).get("archivoBD");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

async function _borrarHandleIDB() {
  try {
    const db = await _abrirIDB();
    const tx = db.transaction(IDB_ALMACEN, "readwrite");
    tx.objectStore(IDB_ALMACEN).delete("archivoBD");
  } catch (e) { /* nada que borrar */ }
}

/**
 * Al cargar cada página, intenta reconectar en silencio el archivo vinculado previamente.
 * - "conectado": el permiso ya estaba concedido, el guardado automático sigue funcionando.
 * - "requiere-permiso": existe un archivo vinculado pero el navegador pide confirmarlo con un clic
 *   (llamar a confirmarPermisoArchivoBD(handle) desde un evento de clic del usuario).
 * - "sin-vincular": nunca se vinculó un archivo en este navegador.
 * - "no-soportado": el navegador no tiene la API de acceso a archivos.
 */
async function intentarReconectarArchivoBD() {
  if (!FSA_DISPONIBLE) return { estado: "no-soportado" };
  const handle = await _obtenerHandleIDB();
  if (!handle) return { estado: "sin-vincular" };
  try {
    const permiso = await handle.queryPermission({ mode: "readwrite" });
    if (permiso === "granted") {
      _manejadorArchivoBD = handle; _nombreArchivoBD = handle.name;
      return { estado: "conectado", nombre: handle.name };
    }
    return { estado: "requiere-permiso", nombre: handle.name, handle };
  } catch (e) {
    return { estado: "sin-vincular" };
  }
}

async function confirmarPermisoArchivoBD(handle) {
  try {
    const permiso = await handle.requestPermission({ mode: "readwrite" });
    if (permiso === "granted") {
      _manejadorArchivoBD = handle; _nombreArchivoBD = handle.name;
      return { ok: true, nombre: handle.name };
    }
    return { ok: false };
  } catch (e) { return { ok: false }; }
}

/** Vincula un archivo nuevo (se crea) para guardado automático a partir de ahora. */
async function vincularArchivoNuevo() {
  if (!FSA_DISPONIBLE) return { ok: false, mensaje: "Tu navegador no soporta vincular archivos automáticamente. Usa la descarga manual." };
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: nombreArchivoSugerido(),
      types: [{ description: "Base de datos LectorIEP", accept: { "application/json": [".json"] } }]
    });
    _manejadorArchivoBD = handle;
    _nombreArchivoBD = handle.name;
    await _guardarHandleIDB(handle);
    await _escribirEnArchivoVinculado();
    return { ok: true, nombre: handle.name };
  } catch (e) {
    if (e.name === "AbortError") return { ok: false, cancelado: true };
    return { ok: false, mensaje: "No se pudo crear el archivo: " + e.message };
  }
}

/** Vincula un archivo .json de base de datos YA EXISTENTE: lo carga y sigue guardando ahí. */
async function vincularArchivoExistente() {
  if (!FSA_DISPONIBLE) return { ok: false, mensaje: "Tu navegador no soporta abrir archivos automáticamente. Usa restaurar manual." };
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "Base de datos LectorIEP", accept: { "application/json": [".json"] } }],
      multiple: false
    });
    const archivo = await handle.getFile();
    const texto = await archivo.text();
    const paquete = JSON.parse(texto);
    const resultado = importarTodo(paquete);
    if (!resultado.ok) return resultado;
    _manejadorArchivoBD = handle;
    _nombreArchivoBD = handle.name;
    await _guardarHandleIDB(handle);
    return { ok: true, nombre: handle.name };
  } catch (e) {
    if (e.name === "AbortError") return { ok: false, cancelado: true };
    return { ok: false, mensaje: "No se pudo abrir el archivo: " + e.message };
  }
}

function desvincularArchivoBD() {
  _manejadorArchivoBD = null;
  _nombreArchivoBD = null;
  _borrarHandleIDB();
}

async function _escribirEnArchivoVinculado() {
  if (!_manejadorArchivoBD) return;
  try {
    const writable = await _manejadorArchivoBD.createWritable();
    await writable.write(JSON.stringify(exportarTodo(), null, 2));
    await writable.close();
  } catch (e) {
    // Si el usuario revocó el permiso o movió el archivo, dejamos de intentar hasta que vuelva a vincular.
    console.warn("No se pudo escribir en el archivo vinculado:", e);
  }
}

// Cada vez que algo cambia en la base de datos, si hay un archivo vinculado, lo actualizamos
// (con un pequeño retraso para agrupar varios cambios seguidos en una sola escritura).
if (typeof onDbChange === "function") {
  onDbChange(() => {
    if (!_manejadorArchivoBD) return;
    clearTimeout(_guardadoPendiente);
    _guardadoPendiente = setTimeout(_escribirEnArchivoVinculado, 600);
  });
}

/* ---------- Respaldo manual (funciona en cualquier navegador) ---------- */

function descargarRespaldoBD() {
  const paquete = exportarTodo();
  const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nombreArchivoSugerido();
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(DB_PREFIX + "ultimo_respaldo", new Date().toISOString());
}

function restaurarRespaldoBD(archivo) {
  return new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = (evt) => {
      try {
        const paquete = JSON.parse(evt.target.result);
        resolve(importarTodo(paquete));
      } catch (e) {
        resolve({ ok: false, mensaje: "El archivo no es un JSON válido de LectorIEP." });
      }
    };
    lector.onerror = () => resolve({ ok: false, mensaje: "No se pudo leer el archivo." });
    lector.readAsText(archivo);
  });
}

function ultimoRespaldoBD() {
  return localStorage.getItem(DB_PREFIX + "ultimo_respaldo");
}
