/**
 * LectorIEP — Sincronización en la nube (Firebase Firestore)
 * ============================================================================
 * Convierte la base de datos local (localStorage) en una base de datos
 * COMPARTIDA entre todos los dispositivos: cada colección (usuarios, libros,
 * préstamos, bitácora, etc.) se guarda como un documento dentro de la
 * colección "lectoriep" en Firestore.
 *
 * Si js/firebase-config.js todavía tiene los valores de ejemplo, o Firebase
 * no está disponible (sin internet, proyecto mal configurado), todas las
 * funciones de aquí fallan en silencio y el sistema sigue funcionando en modo
 * local, exactamente como antes de agregar este archivo.
 * ============================================================================
 */

const NUBE_COLECCION_RAIZ = "lectoriep";

let _cloudDb = null;
let _cloudListo = false;
let _cloudError = null;

function cloudConfigurada() {
  return typeof FIREBASE_CONFIG !== "undefined" && !!FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "TU_API_KEY";
}

function cloudDisponible() { return _cloudListo && !_cloudError; }

function _inicializarCloud() {
  if (_cloudListo || _cloudError) return _cloudListo;
  if (!cloudConfigurada() || typeof firebase === "undefined") { _cloudError = "no-configurado"; return false; }
  try {
    const app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
    _cloudDb = firebase.firestore(app);
    _cloudListo = true;
    return true;
  } catch (e) {
    _cloudError = e;
    console.warn("LectorIEP: no se pudo inicializar Firebase.", e);
    return false;
  }
}

/**
 * Descarga TODAS las colecciones desde Firestore y las escribe en localStorage,
 * dejando este dispositivo al día con lo que hayan guardado los demás.
 * Se llama una vez al abrir cada página, antes de leer cualquier dato.
 * @param {number} tiempoMaximoMs  cuánto esperar como máximo (por defecto 6s)
 * @returns {Promise<{ok:boolean, vacio?:boolean, cambios?:boolean, motivo?:string}>}
 */
async function sincronizarDesdeNube(tiempoMaximoMs) {
  if (!_inicializarCloud()) return { ok: false, motivo: "sin-configurar" };

  const espera = new Promise(resolve => setTimeout(() => resolve({ ok: false, motivo: "tiempo-agotado" }), tiempoMaximoMs || 6000));

  const trabajo = (async () => {
    try {
      const snap = await _cloudDb.collection(NUBE_COLECCION_RAIZ).get();
      if (snap.empty) {
        // Nube recién creada y sin datos todavía: la sembramos con lo que ya tenemos localmente
        // (por ejemplo, la cuenta inicial del administrador) para que quede como punto de partida compartido.
        await subirTodoAhoraANube();
        return { ok: true, vacio: true, cambios: false };
      }

      let huboCambios = false;
      snap.forEach(doc => {
        const contenido = doc.data();
        if (!Array.isArray(contenido.data)) return;
        const nuevoJSON = JSON.stringify(contenido.data);
        const anteriorJSON = localStorage.getItem(dbKey(doc.id));
        if (nuevoJSON !== anteriorJSON) {
          huboCambios = true;
          localStorage.setItem(dbKey(doc.id), nuevoJSON);
        }
      });
      localStorage.setItem(dbKey("version"), DB_VERSION);
      return { ok: true, cambios: huboCambios };
    } catch (e) {
      _cloudError = e;
      console.warn("LectorIEP: no se pudo sincronizar desde la nube.", e);
      return { ok: false, motivo: "error" };
    }
  })();

  return Promise.race([trabajo, espera]);
}

/* ---------- Subida automática: cada vez que algo cambia localmente, se empuja a la nube ---------- */

const _pendientesNube = {};

function _empujarColeccionANube(nombreColeccion) {
  if (!cloudDisponible()) return;
  clearTimeout(_pendientesNube[nombreColeccion]);
  _pendientesNube[nombreColeccion] = setTimeout(async () => {
    try {
      const valor = dbGet(nombreColeccion);
      await _cloudDb.collection(NUBE_COLECCION_RAIZ).doc(nombreColeccion).set({
        data: valor,
        actualizadoEl: new Date().toISOString()
      });
    } catch (e) {
      console.warn(`LectorIEP: no se pudo guardar "${nombreColeccion}" en la nube.`, e);
    }
  }, 500);
}

if (typeof onDbChange === "function") {
  onDbChange((nombreColeccion) => { _empujarColeccionANube(nombreColeccion); });
}

/** Fuerza a subir TODAS las colecciones ahora mismo (sin esperar el debounce). Uso: restauraciones/reset. */
async function subirTodoAhoraANube() {
  if (!_inicializarCloud()) return { ok: false };
  try {
    const lote = _cloudDb.batch();
    COLECCIONES_BD.forEach(nombre => {
      const ref = _cloudDb.collection(NUBE_COLECCION_RAIZ).doc(nombre);
      lote.set(ref, { data: dbGet(nombre), actualizadoEl: new Date().toISOString() });
    });
    await lote.commit();
    return { ok: true };
  } catch (e) {
    console.warn("LectorIEP: no se pudo subir la base de datos completa a la nube.", e);
    return { ok: false };
  }
}
