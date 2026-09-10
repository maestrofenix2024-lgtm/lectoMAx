# LectorIEP — Sistema de Seguimiento de Lectura Escolar

**IEP N.° 20150 "Mariscal Benavides" — UGEL 08, Cañete**
Proyecto institucional desarrollado desde la Coordinación de Innovación y Soporte Tecnológico (CIST).

## ¿Qué es?

Una plataforma web integral para gestionar el **Plan Lector** del colegio: bitácora de lectura, biblioteca
y préstamos, evaluaciones de comprensión lectora alineadas a los niveles de logro del Currículo Nacional
(MINEDU: Inicio / Proceso / Logro Esperado / Logro Destacado), gamificación (puntos, rachas, insignias,
niveles de lector), paneles diferenciados por rol y reportes exportables.

El diseño de funcionalidades se inspiró en sistemas de referencia investigados para este proyecto:
plataformas de seguimiento lector tipo **Beanstack** (registro de minutos/libros, rachas, insignias),
programas adaptativos de comprensión lectora tipo **Lexia Core5** (diagnóstico por niveles, paneles por
rol), sistemas de biblioteca escolar tipo **Reading Cloud** (catálogo, préstamos, perfiles de estudiante),
y plataformas de gestión escolar tipo **SchoolTrack/Colegium** (paneles institucionales y reportes),
adaptando todo a la realidad del colegio, al Currículo Nacional peruano y al rol CIST.

## Primaria y Secundaria

El colegio tiene ambos niveles, así que todo el sistema distingue entre **Primaria (1° a 6°)** y
**Secundaria (1° a 5°)**: las aulas, los estudiantes y el catálogo de libros se registran indicando el
nivel además del grado y la sección (ej. *Primaria 3° "B"* y *Secundaria 3° "B"* son aulas distintas,
aunque compartan grado y sección). Los reportes, el ranking y los gráficos del panel CIST muestran ambos
niveles por separado.

## Roles del sistema

| Rol | Acceso por defecto (configurable módulo por módulo desde Configuración) |
|---|---|
| **Coordinador CIST** | Panel institucional, Configuración (usuarios/aulas), Panel docente, Catálogo, Préstamos, Reportes, Ranking, Base de datos, Perfil |
| **Docente** | Panel docente (con gestión de sus propias aulas/estudiantes), Catálogo, Reportes, Ranking, Perfil |
| **Bibliotecario(a)** | Catálogo, Préstamos y devoluciones, Reportes, Perfil |
| **Estudiante** | Mi lectura, Bitácora, Catálogo, Evaluaciones, Ranking, Perfil |
| **Padre / Madre** | Seguimiento del progreso de su hijo(a), Reportes, Perfil |

Estos son los módulos que trae cada rol **por defecto** al crearlo — el administrador puede marcar o
desmarcar cualquier módulo para cada persona en particular desde **Configuración → Usuarios**, así que dos
docentes, por ejemplo, podrían terminar con accesos distintos si así se decide.

## El sistema arranca vacío — sin datos de ejemplo

LectorIEP **no trae libros, aulas, estudiantes, préstamos ni evaluaciones de muestra**. La única cuenta
con la que arranca es la del administrador (Coordinación CIST), para que puedas entrar por primera vez y
registrar tú mismo(a) todo lo demás:

| Rol | Correo | Contraseña |
|---|---|---|
| CIST (cuenta inicial) | admin | admin123 |

**Recomendación:** cambia esta contraseña desde *Mi perfil* apenas ingreses por primera vez.

Solo pueden iniciar sesión las cuentas que el administrador haya registrado desde **Configuración** — no
hay selector de "usuario de demostración" en el login. Cada cuenta nueva queda con el rol y los módulos
que el administrador le asigne en ese momento (ver más abajo).

## Módulos incluidos

1. **Autenticación por cuentas registradas**: solo entra quien el CIST haya dado de alta desde
   Configuración; cada usuario ve en su menú lateral únicamente los módulos que se le asignaron.
2. **Configuración** (CIST): alta de todo el personal y estudiantado —individual o masiva por plantilla
   Excel (columnas Nombre, Correo, Rol, Aula, Cargo, Contraseña)—, asignación de rol y de los módulos
   específicos a los que cada quien puede entrar, gestión de aulas/grados/secciones (crear, editar,
   eliminar, asignar docente responsable y meta mensual).
3. **Bitácora de lectura**: registro de páginas, minutos, autoevaluación y comentario; cálculo automático de
   puntos, racha de días consecutivos e insignias.
4. **Catálogo de biblioteca**: búsqueda y filtros por género, nivel MINEDU y grado; ficha de detalle;
   gestión (alta de libros) para CIST/docente/bibliotecario.
5. **Préstamos y devoluciones**: control de vigentes, atrasados e historial, con actualización automática
   de disponibilidad de ejemplares.
6. **Evaluaciones de comprensión lectora**: cuestionarios por libro, calificación automática y
   clasificación según los niveles de logro del Currículo Nacional; banco de evaluaciones editable por
   CIST/docente (crear, editar y eliminar preguntas y opciones).
7. **Gamificación**: puntos, rachas, 8 insignias, 4 niveles de lector, ranking por aula/grado.
8. **Panel docente**: seguimiento por aula, promedio de comprensión, alertas de estudiantes sin actividad
   reciente, y una pestaña de **gestión de aulas y estudiantes**: crear aulas propias, registrar estudiantes
   de forma individual o **masiva mediante plantilla Excel** (descargable desde la misma pantalla),
   reasignar estudiantes entre sus aulas y marcar retiros (baja/reactivación) sin perder su historial.
9. **Panel CIST**: KPIs institucionales, gráficos (Chart.js) de niveles de logro y libros leídos por grado,
   calendario del plan de fomento lector.
10. **Reportes**: filtro por aula y rango de fechas, exportación a CSV/Excel e impresión/PDF vía el navegador.
11. **Seguimiento familiar**: vista de solo lectura para madres/padres sobre el progreso de su hijo(a).
12. **Perfil de usuario** editable (nombre, correo, contraseña) con insignias y datos de contacto.
13. **CRUD completo** en cada módulo: todo registro que se muestra en pantalla puede crearse, editarse y
    eliminarse desde la propia interfaz — bitácora de lectura, préstamos, aulas, usuarios, asignaciones de
    lectura, actividades del plan lector y el banco de evaluaciones.
14. **Reseñas y calificación de libros**: cada libro muestra el promedio de estrellas y los comentarios que
    dejaron los estudiantes en su bitácora, a modo de reseñas visibles para toda la comunidad lectora.
15. **Premios — tienda de puntos**: CIST/bibliotecario crean un catálogo de premios con costo en puntos y
    stock; los estudiantes canjean sus puntos de lectura por ellos, y el personal marca los canjes como
    entregados.
16. **Libros más leídos**: ranking de los títulos con más lecturas registradas, visible en el panel CIST.
17. **Certificado de lectura imprimible**: cada estudiante puede generar e imprimir su propio certificado
    (nivel de lector, puntos, libros leídos) con membrete institucional, desde su perfil.

## Arquitectura técnica

- **Frontend puro**: HTML5, CSS3 (diseño propio, sin frameworks de UI) y JavaScript (ES6+), sin build step.
- **Persistencia**: `localStorage` como caché local rápida del día a día (`js/data.js`), sincronizada con
  una **base de datos compartida en la nube (Firebase Firestore)** para que todos los dispositivos vean la
  misma información — ver sección siguiente. El sistema arranca sin datos de ejemplo, solo con la cuenta
  inicial del administrador.
- **Librerías externas (CDN)**: Bootstrap Icons, Chart.js, SheetJS (xlsx), Firebase (App + Firestore),
  tipografías Fraunces + Inter (Google Fonts).
- **Sin backend propio**: no hay servidor que programar ni desplegar — Firebase actúa como base de datos
  gestionada; una migración a un backend propio (Spring Boot + PostgreSQL, por ejemplo) seguiría siendo
  posible más adelante reemplazando `js/cloud.js`.

## Base de datos compartida en la nube (Firebase) — para que TODOS vean los mismos datos

Por defecto, cada navegador guarda su propia copia de los datos (`localStorage`), así que si subes el
sistema a un hosting sin configurar esto, cada persona que entre verá solo lo que *ella* haya registrado,
no lo que registraron los demás. Para que todos —CIST, docentes, bibliotecario(a), estudiantes y
padres— vean la misma información sin importar desde qué computadora o celular entren, el sistema se
sincroniza con un proyecto gratuito de **Firebase Firestore**:

1. Crea un proyecto gratuito en <https://console.firebase.google.com> (no pide tarjeta) y activa
   **Firestore Database**.
2. En Firestore → **Reglas**, define quién puede leer/escribir (para empezar rápido puedes usar
   `allow read, write: if true;`, y restringirlo más adelante).
3. Copia el objeto de configuración de tu proyecto (Configuración del proyecto → Tus apps → app web) dentro
   de `js/firebase-config.js`, reemplazando los valores de ejemplo.
4. Sube el sistema (con ese archivo ya editado) a tu hosting. **No hace falta nada más**: todos los
   visitantes se conectan automáticamente al mismo proyecto y comparten los mismos datos.

**Cómo funciona:** cada colección (usuarios, libros, préstamos, bitácora, evaluaciones, aulas, premios...)
se guarda como un documento dentro de la colección `lectoriep` en Firestore. Al abrir cualquier página, el
sistema descarga primero lo último guardado en la nube; cada vez que alguien registra o edita algo, ese
cambio se sube automáticamente (con un pequeño retraso para agrupar cambios seguidos). Si mientras usas el
sistema otra persona guarda algo nuevo desde otro dispositivo, aparece un aviso arriba de la pantalla para
recargar y verlo.

Si dejas `js/firebase-config.js` con los valores de ejemplo (o no tienes internet), el sistema sigue
funcionando exactamente igual que antes: solo en el navegador de cada quien, sin compartir datos.

> **Nota de seguridad:** con la regla `allow read, write: if true;` cualquiera que conozca la URL de tu
> proyecto de Firestore podría leer o modificar los datos directamente (sin pasar por el login del
> sistema). Es razonable para empezar o para un piloto, pero para un uso institucional serio conviene
> restringir las reglas de Firestore más adelante (por dominio, o agregando autenticación de Firebase).

## Archivo de base de datos local (respaldo, no reemplaza la nube)

Además de la nube, cada dispositivo puede mantener su propio respaldo en un archivo `.json` real desde
**Base de datos** en el panel CIST (`pages/basededatos.html`):

- **Guardado automático en archivo** (Chrome, Edge, Opera): el CIST vincula un archivo `.json` una sola vez
  y, desde ese momento, cada cambio que ocurre en el sistema —lo haga quien lo haga, desde cualquier
  pantalla— se escribe ahí solo, en segundo plano. El vínculo se recuerda entre sesiones (IndexedDB); si el
  navegador pide confirmar el permiso de nuevo, aparece un aviso en la campanita de la barra superior.
- **Respaldo manual** (cualquier navegador, incluido Firefox y Safari): botón para descargar toda la base
  de datos en un `.json`, y otro para restaurar el sistema completo a partir de un archivo descargado antes
  — disponible tanto en el panel CIST como en la pantalla de inicio de sesión.
- Este archivo es un respaldo/copia portátil de UN dispositivo — no sustituye a Firebase si lo que
  necesitas es que varios usuarios compartan los mismos datos en tiempo real.

## Cómo usarlo

1. **(Opcional pero recomendado si varias personas van a usarlo)** Configura tu proyecto de Firebase en
   `js/firebase-config.js` como se explica arriba, para que todos compartan la misma base de datos.
2. Descomprime la carpeta.
3. Abre `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox), o súbelo a tu hosting.
4. Ingresa con la cuenta inicial del administrador (ver tabla de credenciales arriba).
5. Ve a **Configuración** y registra a tu personal y estudiantado (individual o por plantilla), define sus
   roles y módulos, y crea las aulas del colegio. Luego carga el catálogo de libros desde **Catálogo**.
6. Desde **Base de datos**, vincula un archivo `.json` si además quieres un respaldo local en algún equipo,
   o descarga copias de seguridad manuales cuando quieras.

## Estructura de archivos

```
sistema-lectura/
├── index.html                 → Inicio de sesión (solo cuentas registradas por el administrador)
├── css/styles.css              → Sistema de diseño (tokens, componentes)
├── js/data.js                  → Lógica de dominio + persistencia (localStorage); arranca sin datos de ejemplo
├── js/firebase-config.js       → Configuración de tu proyecto Firebase (edítalo antes de desplegar)
├── js/cloud.js                 → Sincronización con Firestore: hace que la base de datos sea compartida
├── js/filedb.js                → Archivo de base de datos local: guardado automático y respaldo manual
├── js/app.js                   → Sesión, navegación por módulos permitidos, toasts, utilidades
└── pages/
    ├── estudiante.html         → Panel del estudiante
    ├── bitacora.html           → Registro de lectura
    ├── biblioteca.html         → Catálogo de biblioteca
    ├── prestamos.html          → Préstamos y devoluciones
    ├── evaluaciones.html       → Evaluaciones de comprensión lectora
    ├── ranking.html            → Ranking y gamificación
    ├── premios.html            → Premios: tienda de puntos y canjes
    ├── docente.html            → Panel docente (incluye gestión de sus aulas y estudiantes)
    ├── admin.html               → Panel CIST (institucional)
    ├── configuracion.html       → Configuración: usuarios, roles, módulos y aulas (CIST)
    ├── reportes.html           → Reportes exportables
    ├── padre.html               → Seguimiento familiar
    ├── perfil.html              → Perfil de usuario
    └── basededatos.html         → Base de datos: vincular archivo, respaldo y restauración (CIST)
```

