/**
 * LectorIEP — Configuración de Firebase
 * ============================================================================
 * Reemplaza los valores de abajo con los de TU PROPIO proyecto de Firebase
 * (gratis) para que el sistema tenga una base de datos compartida en la nube:
 * todos los que abran el sistema (desde cualquier computadora o celular) leerán
 * y escribirán en el mismo lugar.
 *
 * CÓMO OBTENERLOS (una sola vez, ~5 minutos):
 *  1. Entra a https://console.firebase.google.com y crea un proyecto nuevo
 *     (gratis, no pide tarjeta).
 *  2. Dentro del proyecto, ve a "Compilación" → "Firestore Database" → "Crear
 *     base de datos" (elige modo de producción o de prueba).
 *  3. En Firestore → pestaña "Reglas", pega esto para empezar (puedes
 *     restringirlo más adelante):
 *        rules_version = '2';
 *        service cloud.firestore {
 *          match /databases/{database}/documents {
 *            match /{document=**} {
 *              allow read, write: if true;
 *            }
 *          }
 *        }
 *  4. Ve a "Configuración del proyecto" (ícono de engranaje) → en "Tus apps"
 *     agrega una app web (</>) → copia el objeto firebaseConfig que te muestra
 *     y pégalo reemplazando el de abajo.
 *  5. Sube este archivo (ya editado) junto con el resto del sistema a tu
 *     hosting. No necesitas hacer nada más — todos los visitantes se
 *     conectarán automáticamente al mismo proyecto.
 *
 * Si dejas los valores de ejemplo tal cual, el sistema sigue funcionando
 * exactamente como antes: solo en el navegador de cada persona, sin compartir
 * datos entre dispositivos.
 * ============================================================================
 */
const firebaseConfig = {
  apiKey: "AIzaSyDjDVg2Qhi9AMb4B6qkIMLsV4UOvy6ZqCE",
  authDomain: "lector-6a406.firebaseapp.com",
  projectId: "lector-6a406",
  storageBucket: "lector-6a406.firebasestorage.app",
  messagingSenderId: "960864333086",
  appId: "1:960864333086:web:cf3eeb60731bef09bcad0f",
  measurementId: "G-CCS7L9BSNG"
};
