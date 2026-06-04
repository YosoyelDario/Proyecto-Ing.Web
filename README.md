# Listas de espera y tiempos de atención excesivos en la municipalidad de Santo Domingo
Proyecto para la asignatura de Ingeniería Web y Móvil enfocado en reducir los tiempos de atención mediante el agendamiento eficiente de citas médicas.

## Datos 
**Universidad:** Pontificia Universidad Católica de Valparaíso

**Curso y paralelo:** ICI4247-2 (Ingenieria web y movil, paralelo 2)

**Integrantes:** Joaquín Antonio Cornejo Fernández, Vicente Miguel Martinez Estay, Dario Joaquin Fuentes Ponce y Francisco Javier Andres Carrasco Bugueño


## Enlace Figma
- [Link prototipo.](https://www.figma.com/design/9cu9UhylwpXm331wHddpt8/Proyecto-Web?node-id=0-1&t=uy2mEo6T7D8t4F7i-1)

## Instrucciones de ejecución del proyecto
1. Clonar el repositorio: `git clone [url]`
2. Acceder al directorio del frontend: `cd [nombre-de-la-carpeta]`
3. Instalar dependencias: `npm install`
4. Levantar el servidor de desarrollo con Vite: `npm run dev`

## [EP 1.1] Definición de requerimientos

Para el desarrollo de la plataforma se tomaron en cuenta 2 roles:

- **Rol Usuario (Paciente):** Persona que utiliza el sistema para agendar, consultar, modificar o cancelar horas médicas.

- **Rol Administrador (Personal Municipal):** Funcionario que gestiona las disponibilidades, horas y atenciones a través de un panel de control.

| Requerimientos Funcionales  | Requerimientos No Funcionales |
| ------------- |:-------------:|
| RF 1: El usuario puede agendar una cita médica, iniciando o no sesión      | RNF 1: El sistema debe poseer una alta facilidad de uso, garantizando que el tiempo de capacitación (o de familiarización) necesario para que un usuario inexperto logre agendar una cita por primera vez sea inferior a 3 minutos     |
| RF 2: El usuario es capaz de consultar su cita médica en la página web a través de un código referido único      | RNF 2: El sistema debe tener un tiempo de respuesta inferior a 10 segundos al momento en que el usuario consulta su cita médica con el código de referido.     |
| RF 3: El usuario es capaz de modificar su cita médica      | RNF 3: El sistema debe garantizar una probabilidad de no disponibilidad inferior al 1% para asegurar que tanto pacientes como administradores tengan acceso continuo a la modificación y cancelación de citas.     |
| RF 4: El usuario es capaz de cancelar su cita médica      | RNF 4: El acceso al panel administrativo debe estar protegido mediante autenticación para evitar que usuarios no autorizados manipulen las citas o accedan a datos de otros pacientes. |
| RF 5: El sistema debe notificar mediante correo electrónico (si el usuario lo proporciona), su cita médica (confirmación o cancelación por el médico).      |      |
| RF 6: El sistema debe contar con un panel administrativo que permite modificar las citas si el médico no se encuentra disponible, así como modificar la cita del usuario.      |      |
| RF 7: El sistema debe comprobar que la cita ha sido agendada correctamente para evitar duplicaciones.      | |


## [EP 1.2]  Justificacion del problema y analisis del usuario objetivo.

#### Analisis del usuario objetivo
El Usuario objetivo que nosotros determinamos, es un usuario general. El cual por lo general no está experimentado para realizar citas médicas de manera online, sino que provienen de un sistema el cual era algo más manual e humano, por lo que el diseño tiene que dar prioridad a la previsibilidad y a la disminución de pasos lógicos, eliminando la fricción procedimental para que una persona sin experiencia pueda finalizar el proceso de programación de manera independiente y sin ambigüedad técnica.

#### Justificacion del problema
Según la información proporcionada respecto a la situación actual con las citas médicas es la siguiente _**"Los usuarios deben esperar meses para consultas o exámenes debido a la
sobre demanda y falta de organización"**_, El sistema (la página web) propone eliminar cuellos de botella administrativos a través de la centralización de datos y la visualización de disponibilidad en tiempo real, garantizando un flujo de agendamiento ordenado y la reducción de tiempos de espera.


## [EP 1.3] Diseño UI/UX y Prototipo en Figma

El prototipo completo se encuentra en el enlace de Figma adjunto al inicio. Se han diseñado más de 7 pantallas distintas correspondientes a los requerimientos, considerando explícitamente las versiones móvil y web:

1. **Pantalla de Inicio de Sesión:** Incluye formulario con validaciones visuales.
2. **Pantalla de Registro:** Formulario que incluye Nombre de usuario, RUT, Correo Electrónico, Región, Comuna, Contraseña, Confirmación de Contraseña y aceptación de términos y condiciones.
3. **Dashboard / Home:** Pantalla principal donde el paciente consulta su cita.
4. **Agendamiento:** Interfaz para seleccionar especialidad, fecha y hora.
5. **Modificar Cita:** Flujo para reagendar horas médicas.
6. **Cancelar Cita:** Interfaz de confirmación de anulación.
7. **Panel de Administración:** Vista exclusiva para personal municipal.

## [EP 1.4]  Arquitectura de Navegación y Experiencia del Usuario

Para asegurar una navegación intuitiva y coherente con el código implementado, se definió la siguiente arquitectura de navegación basada en React Router:

* **(a) Rutas principales y secundarias:**
  * **Principales:** `/` (Home), `/login`, `/register`.
  * **Secundarias (Flujo de Citas):** `/agendar`, `/consultar`, `/modificar`, `/cancelar`, `/confirmacion`.
  * **Administrativas:** `/admin` (AdminPanel) y `/admin/gestion` (GestionCitas).

* **(b) Relaciones jerárquicas entre vistas:**
  * La aplicación utiliza una estructura plana para las rutas de usuario para facilitar el acceso rápido. Además, se implementan componentes envolventes (Layouts) como `AuthLayout.tsx` para mantener una jerarquía visual consistente en los flujos de autenticación, y `PageTransition.tsx` para suavizar la navegación entre vistas.

* **(c) Flujo de navegación entre funcionalidades:**
  * **Agendamiento:** `Home` -> `Agendar` (donde interactúa con `CalendarPicker.tsx` y `SelectInput.tsx`) -> `ConfirmacionCita`.
  * **Gestión personal:** `Home` -> `ConsultarCita` -> (Opcional) `ModificarCita` o `CancelarCita`.

* **(d) Diferenciación de acceso según roles:**
  * Se definen claramente dos accesos. El Rol Usuario navega por las vistas públicas y de agendamiento. El Rol Administrador accede a la carpeta `/admin`. Para proteger esto a nivel de código, se implementó el componente `<AdminRuta />` (HOC - Higher Order Component), que intercepta la navegación y bloquea el acceso si el usuario no tiene los permisos necesarios.

* **(e) Flujo de principales tareas (Task Flow):**
  * **Agendar Cita:** `Ingreso a /agendar` -> `Selección de fecha/hora (CalendarPicker)` -> `Ingreso de datos (RutInput, InputTexto)` -> `Redirección a /confirmacion`.

* **(f) Puntos críticos de interacción:**
  * Los formularios de autenticación y agendamiento son críticos. Para mitigar errores, se modularizaron los inputs (`RutInput.tsx`, `EmailInput.tsx`, `PasswordInput.tsx`) centralizando las validaciones. Otro punto crítico es `ConfirmacionCita.tsx`, donde se le da la certeza al usuario de que el proceso en `citaServices.ts` fue exitoso.

* **(g) Coherencia de experiencia entre dispositivos:**
  * Apoyándonos en los componentes de Ionic, se garantiza la responsividad. Se utilizan contenedores flexibles que se adaptan a vistas móviles (ej. Bottom Tabs nativos de Ionic) y vistas de escritorio (menús laterales), manteniendo siempre presentes elementos como el `LogoSantoDomingo.tsx` y el `BotonVolver.tsx` para no perder al usuario.

* **(h) Justificación técnica de las decisiones:**
  * Se optó por una modularización en la carpeta `/components` (separando botones, inputs específicos y layouts) para maximizar la reutilización de código y la escalabilidad de la arquitectura frontend. Asimismo, la lógica de conexión a datos se extrajo completamente de las vistas hacia la carpeta `/services` (`AuthServices.ts`, `citaServices.ts`), asegurando que los componentes de React (`.tsx`) se enfoquen exclusivamente en la interfaz (UI) y la experiencia de usuario (UX).

## [EP 1.5] Creación del proyecto en Ionic con React

El proyecto base fue inicializado utilizando Ionic con React, estructurando la navegación de la siguiente manera:

* **(a) Uso de React Router:** Se implementó `react-router-dom` para gestionar la navegación tipo Single Page Application (SPA), renderizando los componentes sin recargar el navegador.
* **(b) Rutas públicas y protegidas:** Se definieron rutas públicas para el acceso general (`/login`, `/registro`, `/home`) y rutas protegidas (ej. `/admin`) que bloquean el renderizado de la vista si el usuario no tiene la sesión activa.
* **(c) Redirecciones:** Se configuró una redirección automática (login obligatorio). Si un visitante intenta acceder directamente por URL a una ruta administrativa, es devuelto automáticamente a `/login`.
* **(d) Estructura modular de vistas:** Cada pantalla se desarrolló como un componente funcional independiente, separando la lógica de la interfaz.


## [EP 1.6] Diseño de pantallas principales y estructura

Se han desarrollado las pantallas principales asegurando coherencia con la arquitectura definida.

* **Uso de Componentes Ionic:** Para asegurar el diseño adaptativo y el comportamiento nativo, las vistas utilizan los componentes estructurales de Ionic: `<IonPage>`, `<IonHeader>`, `<IonContent>`, `<IonMenu>` (para la navegación web) y `<IonTabs>` (para dispositivos móviles).
* **Separación estructural del código:** El proyecto mantiene un código ordenado dividido en las siguientes carpetas:
  * `/pages`: Contiene las vistas completas de la aplicación.
  * `/components`: Almacena componentes de UI reutilizables.
  * `/routes`: Define la lógica de enrutamiento y las validaciones de las rutas protegidas.
  * `/services`: Carpeta preparada para la futura integración con el backend y llamadas a la API.
## [EP 2.1] Creación del Servidor Backend

## Tecnologías utilizadas

- **Runtime:** Node.js v24
- **Framework:** Express.js v5
- **Base de datos:** PostgreSQL (via `pg`)
- **Autenticación:** JSON Web Tokens (`jsonwebtoken`)
- **Seguridad:** `bcrypt` para hash de contraseñas
- **Variables de entorno:** `dotenv`
- **CORS:** `cors`
- **Desarrollo:** `nodemon`

---

## Estructura del proyecto

```
backend/
├── index.js                        # Punto de entrada del servidor
├── package.json
├── .env example                    # Variables de entorno de referencia
└── src/
    ├── controllers/                # Lógica de negocio por módulo
    │   ├── authController.js
    │   ├── citasController.js
    │   ├── profesionalesController.js
    │   ├── ubicacionesController.js
    │   └── usuariosController.js
    ├── db/
    │   ├── pool.js                 # Conexión a PostgreSQL
    │   └── queries/                # Consultas SQL por módulo
    │       ├── citas.js
    │       ├── profesionales.js
    │       ├── ubicaciones.js
    │       └── usuarios.js
    ├── middleware/
    │   └── auth.js                 # JWT: verificarToken, tokenOpcional, soloAdmin
    ├── routes/                     # Definición de rutas por módulo
    │   ├── auth.js
    │   ├── citas.js
    │   ├── profesionales.js
    │   ├── ubicaciones.js
    │   └── usuarios.js
    ├── utils/
    │   └── ubicaciones.js          # Validación de región/comuna
    └── data/
        └── regiones.json           # Datos de regiones y comunas de Chile
```

---

## Configuración del servidor (`index.js`)

El servidor está construido sobre **Express.js** y se configura con los siguientes middlewares globales:

- `cors()` — permite solicitudes desde el frontend
- `express.json()` — parsea el body de las solicitudes en formato JSON

### Rutas registradas

| Prefijo | Router | Descripción |
|---------|--------|-------------|
| `/api/auth` | `authRouter` | Registro, login y logout |
| `/api` | `profesionalesRouter` | Especialidades y profesionales |
| `/api` | `ubicacionesRouter` | Regiones y comunas |
| `/api/citas` | `citasRouter` | Gestión de citas médicas |
| `/api/usuarios` | `usuariosRouter` | Gestión de usuarios |

### Manejo de errores global

El servidor incluye dos manejadores de error al final del pipeline:

- **404** — responde `{ error: 'Endpoint no encontrado.' }` para rutas inexistentes
- **500** — captura errores no controlados y responde `{ error: 'Error interno del servidor.' }`

### Puerto

El servidor corre en el puerto definido por la variable de entorno `PORT`, o en el puerto `3000` por defecto.

---

## Variables de entorno

Crear un archivo `.env` en la raíz del backend con las siguientes variables (ver `.env example`):

```env
PORT=3000
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_bd
JWT_SECRET=tu_clave_secreta
```

---

## Middlewares de autenticación (`src/middleware/auth.js`)

Se implementaron tres middlewares para proteger las rutas según el nivel de acceso requerido:

| Middleware | Descripción |
|-----------|-------------|
| `verificarToken` | Exige Bearer Token válido. Retorna `401` si falta o expiró, `403` si es inválido. |
| `tokenOpcional` | Acepta solicitudes con o sin token. Si hay token válido, adjunta el usuario a `req.usuario`; si no, continúa con `req.usuario = null`. |
| `soloAdmin` | Complementa `verificarToken`. Verifica que `req.usuario.is_admin === true`. Retorna `403` si el usuario no es administrador. |

---

## Cómo ejecutar el servidor

```bash
pnpm install

pnpm run dev

```

El servidor estará disponible en `http://localhost:3000`.

---


## [EP 2.2] Configuración y modelado de la base de datos

Se diseñó y modeló una base de datos relacional normalizada en el motor ... que garantiza integridad de datos, escalabilidad y rastrabilidad de operaciones.

[![Modelo Relacional BD](DiagramaBaseFinal.png)](https://github.com/YosoyelDario/Proyecto-Ing.Web/blob/Rama-Vicho/DiagramaBaseFinal.png?raw=true)

Se modeló la BD a usar considerando 8 entidades como se observa en el modelo relacional. Algunas de las decisiones claves tomadas fueron:
* **Calendario flexible:** Se usó un modelo de horarios recurrentes al cual se le pueden agregar excepciones puntuales (feriados, permisos, licencias, etc).
* **Código de referencia para citas:** Se usara un formato `YYMMDDCCC` de codigo auto-generado para entregar un codigo referencial a los pacientes diferente al id interno.
* **Trazabilidad de cambios:** Se implementó la entidadd cambiosCita cuyo objetivo es llevar trazabilidad total de quién, cuándo y qué se cambio en el sistema.

## [EP 2.3] Desarrollo de API REST

La API REST fue desarrollada con **Express 5** sobre Node.js. Todos los endpoints retornan respuestas en formato **JSON** y utilizan los códigos HTTP estándar (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`). La URL base del servidor es `http://localhost:3000`.

La autenticación se maneja mediante **Bearer Token JWT** en el header `Authorization`. 
Los niveles de acceso requeridos para interactuar con la interfaz se definen bajo tres categorías:

- Público: El endpoint no requiere credenciales de autenticación (aunque algunos pueden aceptar token de forma opcional).

- Usuario: El endpoint requiere la provisión de un token JWT válido en la cabecera del request.

- Administrador: El endpoint exige un token JWT válido que contenga privilegios de rol administrativo.

---

### `/api/auth` — Autenticación

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario paciente |
| `POST` | `/api/auth/login` | Público | Inicia sesión y retorna un JWT |
| `POST` | `/api/auth/logout` | Usuario | Cierra la sesión (invalida token en cliente) |

**`POST /api/auth/register`**
```json
// Request body
{
  "rut": "12345678-9",
  "nombre_completo": "Juan Pérez",
  "email": "juan@correo.cl",
  "password": "miContraseña123",
  "region": "Valparaíso",
  "comuna": "Limache"
}
// Response 201
{ "mensaje": "Usuario registrado", "usuario": { "id": 1, "rut": "12345678-9", "email": "juan@correo.cl" } }
```

**`POST /api/auth/login`**
```json
// Request body
{ "email": "juan@correo.cl", "password": "miContraseña123" }
// Response 200
{ "token": "<jwt>", "usuario": { "id": 1, "rut": "...", "nombre_completo": "...", "email": "...", "region": "...", "comuna": "...", "is_admin": false } }
```

---

### `/api/citas` — Gestión de Citas

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/api/citas/disponibilidad?id_medico=&fecha=` | Público | Retorna horarios disponibles para un médico en una fecha |
| `GET` | `/api/citas/mis-citas` | Usuario | Retorna las citas del usuario en sesión |
| `GET` | `/api/citas/all` | Administrador | Retorna todas las citas del sistema |
| `GET` | `/api/citas/:codigo` | Público | Retorna el detalle de una cita por su código de referencia |
| `POST` | `/api/citas` | Público (token Opcional) | Crea una nueva cita (soporta paciente con cuenta o invitado) |
| `PATCH` | `/api/citas/:codigo` | Público (token Opcional) | Modifica la fecha y hora de una cita existente |
| `PATCH` | `/api/citas/:codigo/cancelar` | Público (token Opcional) | Cancela una cita por su código de referencia |
| `DELETE` | `/api/citas/:codigo` | Administrador | Elimina permanentemente una cita del sistema |

**`POST /api/citas`** — Paciente con cuenta (token presente):
```json
// Request body (los datos del paciente se extraen del JWT)
{ "id_medico": 2, "fecha": "2025-08-15", "hora": "10:30" }
// Response 201
{ "mensaje": "Cita agendada exitosamente.", "codigo_referencia": "AB3X9K2M", "cita": { ... } }
```
**`POST /api/citas`** — Paciente invitado (sin token):
```json
// Request body
{ "id_medico": 2, "fecha": "2025-08-15", "hora": "10:30", "rut": "12345678-9", "nombre": "Juan Pérez", "email": "juan@correo.cl" }
```

**`PATCH /api/citas/:codigo`**
```json
// Request body
{ "fecha": "2025-08-20", "hora": "11:00" }
// Response 200
{ "mensaje": "Cita modificada exitosamente.", "cita": { ... } }
```

---

### `/api/especialidades` y `/api/profesionales` — Catálogo médico

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/api/especialidades` |  Público | Lista todas las especialidades disponibles |
| `GET` | `/api/especialidades/:id/medicos` |  Público | Lista los médicos de una especialidad |
| `POST` | `/api/profesionales` | Administrador | Crea un nuevo profesional |
| `PATCH` | `/api/profesionales/:id` | Administrador | Actualiza los datos de un profesional |
| `DELETE` | `/api/profesionales/:id` | Administrador | Elimina un profesional |

---

### `/api/usuarios` — Gestión de Usuarios

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/api/usuarios/me` | Usuario | Retorna el perfil del usuario en sesión |
| `PATCH` | `/api/usuarios/me` | Usuario | Actualiza región y comuna del perfil |
| `PATCH` | `/api/usuarios/me/password` | Usuario | Cambia la contraseña del usuario |
| `POST` | `/api/usuarios/admin` | Administrador | Crea un nuevo usuario con rol administrador |
| `DELETE` | `/api/usuarios/me` | Usuario | Elimina la cuenta del usuario en sesión |

---

### `/api/regiones` — Ubicaciones

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| `GET` | `/api/regiones` | Público | Retorna el listado de regiones y comunas de Chile |

---

### Manejo de errores

Todos los endpoints manejan errores de forma consistente:

| Código | Situación |
|--------|-----------|
| `400` | Campos obligatorios faltantes o datos inválidos (ej. RUT/email ya registrado, región/comuna inválida) |
| `401` | Token no proporcionado o sesión expirada |
| `403` | Token inválido o intento de acceso a recurso de otro usuario / sin rol admin |
| `404` | Recurso no encontrado (cita, profesional, usuario) |
| `409` | Conflicto de datos (horario ya reservado, cita ya cancelada) |
| `500` | Error interno del servidor |



## [EP 2.4] Consumo de API REST desde Ionic

## EP 2.4 — Consumo de la API REST desde Ionic con React

### Tecnología utilizada

Se utilizó **Axios** en lugar de `fetch` nativo. La razón principal es que Axios provee un sistema de interceptores formal, simplifica el manejo de errores HTTP (rechaza automáticamente respuestas 4xx/5xx en lugar de resolverlas) y permite centralizar la lógica de autenticación en un único lugar.

---

### Arquitectura de servicios

Todos los servicios están organizados en dos archivos dentro de `frontend/src/services/`:

| Archivo | Responsabilidad |
|---|---|
| `AuthServices.ts` | Instancia Axios, interceptores, gestión de JWT y sesión |
| `citaServices.ts` | Funciones de consumo de todos los endpoints de citas y especialidades |

Se define una única instancia compartida de Axios (`apiClient`) con la URL base configurada mediante variable de entorno (`VITE_API_URL`). Todas las páginas consumen esta instancia, garantizando que los interceptores se apliquen siempre.

---

### Interceptores

Se implementaron dos interceptores sobre la instancia de Axios:

**Interceptor de Request** — Antes de cada petición, lee el token del `sessionStorage` y lo adjunta automáticamente en la cabecera `Authorization: Bearer <token>`. Si no hay sesión activa, la cabecera se omite y la petición continúa normalmente (útil para rutas públicas).

**Interceptor de Response** — Centraliza el manejo de errores HTTP para todas las peticiones:
- **401**: token expirado → limpia la sesión local y emite un evento global (`auth_error`) para que la app redirija al login.
- **403 con mensaje de token inválido**: token corrupto → mismo comportamiento que el 401.
- **403 sin token**: falta de permisos reales (ej: usuario no admin) → rechaza con mensaje descriptivo sin cerrar sesión.
- **Otros errores**: extrae el mensaje del cuerpo de la respuesta o usa el mensaje genérico de Axios.

---

### Gestión de tokens JWT

El ciclo completo del JWT se maneja en `AuthService` sin librerías externas:

- **Decodificación**: el payload del JWT (parte central entre los dos puntos) se decodifica en base64 para leer los datos del usuario y la fecha de expiración (`exp`), sin necesidad de verificar la firma en el cliente.
- **Verificación de expiración**: se compara el campo `exp` del payload con la hora actual antes de cada uso del token, evitando peticiones innecesarias al servidor cuando ya expiró localmente.
- **Persistencia**: el token y los datos del usuario se guardan en `sessionStorage`, que se limpia automáticamente al cerrar la pestaña o el navegador, a diferencia de `localStorage` que persiste indefinidamente.
- **Cierre de sesión**: consume el endpoint `POST /api/auth/logout` del backend y limpia el `sessionStorage` independientemente del resultado, garantizando que la sesión local siempre quede cerrada.

---

### Manejo de errores

Los errores HTTP quedan centralizados en el interceptor de respuesta, por lo que las páginas y funciones de servicio no necesitan inspeccionar `response.status` manualmente. Solo se capturan casos puntuales que no son errores de aplicación, como el 404 al consultar una cita por código, que se trata como "cita no encontrada" y retorna `null` en lugar de lanzar una excepción.

---

### Rutas según nivel de autenticación

| Tipo | Ejemplos | Comportamiento |
|---|---|---|
| **Pública** | `getEspecialidades`, `getHorariosDisponibles` | Sin token, o con token si hay sesión activa |
| **Token opcional** | `crearCita`, `modificarCita`, `cancelarCita` | El backend asocia la cita al usuario si hay token, o acepta datos de invitado si no |
| **Autenticada** | `getMisCitas` | Requiere token válido; 401 cierra sesión automáticamente |
| **Solo admin** | `getAllCitas`, `eliminarCita` | Requiere token con `is_admin: true`; 403 rechaza la acción |

## EP 2.5 — Implementación de Autenticación con JWT

Se implementó un sistema de autenticación completo basado en **JSON Web Tokens (JWT)**, que cubre el registro e inicio de sesión de usuarios, la protección de rutas en el frontend, y la diferenciación de acceso según rol.



### Estructura de archivos relacionados

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.js       # Lógica de registro, login y perfil
│   ├── middleware/
│   │   └── auth.js                 # Middleware de verificación JWT
│   ├── routes/
│   │   └── auth.js                 # Rutas públicas y protegidas de autenticación
│   └── db/
│       └── queries/
│           └── usuarios.js         # Consultas SQL de usuarios

frontend/
└── src/
    ├── pages/
    │   ├── Login.tsx
    │   └── Register.tsx
    ├── routes/
    │   └── PrivateRoute.tsx        # Rutas protegidas por rol
    └── services/
        └── authService.ts          # Consumo de la API de autenticación
```



### Formulario de registro e inicio de sesión

El formulario de **registro** incluye los siguientes campos con validación visual:

| Campo                   | Tipo     | Validación                                    |
|-------------------------|----------|-----------------------------------------------|
| RUT                     | text     | Requerido, único en BD (constraint `UNIQUE`)  |
| Nombre completo         | text     | Requerido                                     |
| Correo electrónico      | email    | Requerido, único en BD (constraint `UNIQUE`)  |
| Región                  | select   | Validada contra `regiones.json` en backend    |
| Comuna                  | select   | Validada contra la región elegida en backend  |
| Contraseña              | password | Requerida, hasheada con bcrypt antes de guardar |
| Confirmación contraseña | password | Cotejada en el frontend                       |

El backend valida región y comuna contra el archivo regiones.json con todas las comunas de Chile antes de insertar

El formulario de **inicio de sesión** solicita correo y contraseña. Tras autenticarse, el backend retorna el token JWT,  el frontend redireccióna automáticamente al panel correspondiente según el rol del usuario.



### Rutas protegidas en el frontend

Las rutas se dividen en tres niveles:
 
- **Públicas**: accesibles sin autenticación (`/login`, `/register`, búsqueda de especialidades, consulta de cita por código).
- **Protegidas**: requieren token JWT válido (`/mis-citas`, `/perfil`).
- **Solo admin**: requieren `is_admin: true` en el payload del token (`/admin`, gestión de profesionales, ver todas las citas).

En el backend esto se refleja directamente en las rutas:
 
```js
// routes/citas.js
router.get('/mis-citas',  verificarToken,              listarCitasUsuario)  // autenticado
router.get('/all',        verificarToken, soloAdmin,   listarTodasCitas)    // solo admin
router.get('/:codigo',                                 obtenerCitaPorCodigo)// público
router.post('/',          tokenOpcional,               crearNuevaCita)      // autenticado o invitado
```


### Generación y validación de JWT

Al autenticarse exitosamente, se genera un token firmado con `JWT_SECRET` que expira en 8 horas. El payload incluye todos los datos necesarios para el frontend sin consultas adicionales:

```js
// authController.js — loginUsuario
const token = jwt.sign(
  {
    id:              usuario.id,
    rut:             usuario.rut,
    nombre_completo: usuario.nombre_completo,
    email:           usuario.email,
    is_admin:        usuario.is_admin,
  },
  process.env.JWT_SECRET,
  { expiresIn: '8h' }
)
```

El **middleware `verificarToken`** valida el token en cada petición a rutas protegidas, diferenciando entre token expirado y token inválido:
 
```js
// middleware/auth.js
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>
 
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' })
  }
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesión expirada. Por favor inicia sesión nuevamente.', expired: true })
    }
    return res.status(403).json({ error: 'Token inválido.' })
  }
}
```

Existe además un middleware **`tokenOpcional`** para rutas que sirven tanto a usuarios autenticados como a invitados (por ejemplo, crear o cancelar una cita). Si no hay token, `req.usuario` queda en `null` y el controlador decide el flujo:
 
```js
// middleware/auth.js — tokenOpcional
const tokenOpcional = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) { req.usuario = null; return next() }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    req.usuario = null
  }
  next()
}
```

El token se transmite en el encabezado `Authorization: Bearer <token>` en todas las peticiones autenticadas desde el frontend.

### Diferenciación por roles

El sistema contempla dos roles de usuario:

| Rol     | Permisos                                                                 |
|---------|--------------------------------------------------------------------------|
| `usuario` | Acceso a su perfil, gestión de citas propias, búsqueda de profesionales, cambiar contraseña |
| `admin`   | Gestión completa de usuarios, profesionales, citas y reportes           |

El rol queda registrado en la base de datos al momento del registro y es incluido en el payload del JWT. El middleware `soloAdmin` protege las rutas administrativas:
 
```js
// middleware/auth.js
const soloAdmin = (req, res, next) => {
  if (!req.usuario?.is_admin) {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' })
  }
  next()
}
```
 
Los admins se crean mediante el endpoint `POST /api/usuarios/admin`, que solo puede invocar otro admin:
 
```js
// routes/usuarios.js
router.post('/admin', verificarToken, soloAdmin, crearUsuarioAdmin)
```

### Endpoints de autenticación y usuarios
 
| Método | Ruta                        | Descripción                                      | Protección         |
|--------|-----------------------------|--------------------------------------------------|--------------------|
| POST   | `/api/auth/register`        | Registro de nuevo usuario                        | Pública            |
| POST   | `/api/auth/login`           | Inicio de sesión, retorna JWT + datos de usuario | Pública            |
| POST   | `/api/auth/logout`          | Cierre de sesión (cliente descarta el token)     | `verificarToken`   |
| GET    | `/api/usuarios/me`          | Obtener perfil del usuario autenticado           | `verificarToken`   |
| PATCH  | `/api/usuarios/me`          | Actualizar región y comuna                       | `verificarToken`   |
| PATCH  | `/api/usuarios/me/password` | Cambiar contraseña                               | `verificarToken`   |
| DELETE | `/api/usuarios/me`          | Eliminar cuenta propia                           | `verificarToken`   |
| POST   | `/api/usuarios/admin`       | Crear usuario administrador                      | `soloAdmin`        |
 
---

## EP 2.6 — Validación de Usuarios y Manejo de Sesiones

 
Se implementaron medidas de seguridad en capas para garantizar la integridad de los datos, el manejo seguro de credenciales y la protección básica ante ataques comunes.
 

 
### Validación de inputs
 
**En el backend**, todos los campos son validados antes de procesarse:
 
```js
// authController.js — registro
if (!validarRegionComuna(region, comuna)) {
  return res.status(400).json({ error: 'Región o comuna no válida. Selecciona una combinación real de Chile.' })
}
 
// citasController.js — crear cita
if (!id_medico || !fecha || !hora) {
  return res.status(400).json({ error: 'Faltan campos obligatorios: id_medico, fecha, hora.' })
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
  return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD.' })
}
 
// usuariosController.js — cambiar contraseña
if (!currentPassword || !newPassword) {
  return res.status(400).json({ error: 'Faltan campos obligatorios.' })
}
```
 
La validación de región/comuna usa `regiones.json`, un mapa completo de las 16 regiones y sus comunas de Chile, impidiendo que se registren ubicaciones inexistentes:
 
```js
// utils/ubicaciones.js
const validarRegionComuna = (region, comuna) => {
  if (!region || !comuna) return false
  const regiones = getRegiones()
  return Array.isArray(regiones[region]) && regiones[region].includes(comuna)
}
```
 
 
### Hash de contraseñas con bcrypt
 
Las contraseñas **nunca se almacenan en texto plano**. Se usa `bcrypt ^6` con sal de 10 rondas en registro, cambio de contraseña y creación de admins:
 
```js
// authController.js — registro
const salt          = await bcrypt.genSalt(10)
const password_hash = await bcrypt.hash(password, salt)
// Se inserta password_hash en la BD; la contraseña original no se guarda
```
 
```js
// authController.js — login
const passwordValida = await bcrypt.compare(password, usuario.password_hash)
if (!passwordValida) {
  return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
}
```
 
```js
// usuariosController.js — cambiar contraseña
const passwordValida = await bcrypt.compare(currentPassword, fila.password_hash)
if (!passwordValida) {
  return res.status(400).json({ error: 'Contraseña actual incorrecta.' })
}
const salt    = await bcrypt.genSalt(10)
const newHash = await bcrypt.hash(newPassword, salt)
await pool.query('UPDATE usuario SET password_hash = $1 WHERE id = $2', [newHash, usuarioId])
```
 
La tabla `usuario` define la columna como `password_hash VARCHAR(72)` (bcrypt produce hasta 72 caracteres) y nunca la expone en ninguna respuesta JSON.
 

 
### Manejo seguro de credenciales
 
**Variables de entorno**: todas las claves sensibles se gestionan mediante `.env`, que está en `.gitignore` y nunca se sube al repositorio. Se incluye `.env example` con los campos necesarios:
 
```env
# .env example
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=santo_domingo
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=token_personalizado
```
 
**Mensajes genéricos**: ante credenciales incorrectas, el servidor responde con el mismo mensaje independientemente de si el correo existe o no, mitigando la enumeración de usuarios:
 
```js
// authController.js — si el usuario no existe o la contraseña no coincide:
return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
```
 
**Sin password en respuestas**: las queries de perfil y las respuestas de login excluyen explícitamente `password_hash`:
 
```js
// db/queries/usuarios.js
const buscarUsuarioPorEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, rut, nombre_completo, email, password_hash, region, comuna, is_admin FROM usuario WHERE email = $1',
    [email]
  )
  return result.rows[0] || null
  // password_hash se usa solo para bcrypt.compare(), nunca se devuelve al cliente
}
 
// usuariosController.js — obtenerPerfil
await pool.query(
  'SELECT id, rut, nombre_completo, email, region, comuna, is_admin, created_at FROM usuario WHERE id = $1',
  [req.usuario.id]
)
// password_hash no aparece en el SELECT
```
 
**Logout stateless**: el diseño usa JWT sin blacklist; el cierre de sesión es responsabilidad del cliente (descarta el token). El endpoint `/api/auth/logout` confirma el cierre con `200 OK`:
 
```js
const logoutUsuario = async (req, res) => {
  res.json({ mensaje: 'Sesión cerrada' })
}
```
 
 
### Protección básica contra inyección SQL
 
Se usan **consultas parametrizadas** con `node-postgres (pg)` en el 100% de las interacciones con la base de datos, usando parámetros posicionales `$1, $2, ...`:
 
```js
// Nunca se concatenan strings en queries — todos los valores van como parámetros
await pool.query(
  `INSERT INTO usuario (rut, nombre_completo, email, password_hash, region, comuna)
   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, rut, email`,
  [rut, nombre_completo, email, password_hash, region, comuna]
)
 
await pool.query(
  'SELECT id, rut, nombre_completo, email, password_hash FROM usuario WHERE email = $1',
  [email]
)
 
await pool.query(
  `SELECT id, nombre FROM profesional WHERE id_especialidad = $1 ORDER BY nombre`,
  [req.params.id]
)
```
 
La base de datos también refuerza la integridad con constraints a nivel de esquema:
 
```sql
-- init.sql — constraints que previenen datos inválidos independientemente del backend
CONSTRAINT chk_cita_estado     CHECK (estado IN ('Agendada', 'Completada', 'Cancelada', 'NoAsiste'))
CONSTRAINT chk_excepcion_tipo  CHECK (tipo IN ('Licencia', 'Feriado'))
CONSTRAINT chk_cambios_accion  CHECK (accion IN ('Creacion', 'Modificacion', 'Cancelacion'))
CONSTRAINT uq_cita_medico_fecha_hora UNIQUE (id_medico, fecha, hora)  -- evita doble reserva
```
 
**CORS** habilitado mediante el paquete `cors` en `index.js`:
 
```js
// index.js
app.use(cors())   // configurable para restringir al origen del frontend en producción
app.use(express.json())
```
 
**Error handler global**: captura errores no controlados para evitar exponer stack traces:
 
```js
// index.js
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ error: 'Error interno del servidor.' })
})
```
 
 
### Dependencias del backend
 
```json
{
  "dependencies": {
    "bcrypt":         "^6.0.0",
    "cors":           "^2.8.6",
    "dotenv":         "^17.4.2",
    "express":        "^5.2.1",
    "jsonwebtoken":   "^9.0.3",
    "pg":             "^8.21.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```
 

### Pasos para ejecutar el backend
 
```bash
# 1. Instalar dependencias
cd backend
npm install       # o pnpm install
 
# 2. Configurar variables de entorno
cp ".env example" .env
# Editar .env con tus credenciales de PostgreSQL y JWT_SECRET
 
# 3. Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE santo_domingo;"
psql -U postgres -d santo_domingo -f "base de datos/init.sql"
# El script crea todas las tablas y hace seed de las especialidades iniciales
 
# 4. Iniciar el servidor en modo desarrollo
npm run dev
# → Servidor corriendo en http://localhost:3000
 
# 5. Verificar que la API responde
curl http://localhost:3000/
# → {"mensaje":"API Santo Domingo funcionando","version":"2.0"}
```

## [EP 2.7] Documentación de Endpoints API REST

> Pruebas funcionales realizadas con **Insomnia**. Todos los endpoints corren sobre `http://localhost:3000`.

---

## 🔐 Autenticación

Los endpoints protegidos requieren un **Bearer Token** en el header `Authorization`.

```
Authorization: Bearer <token_jwt>
```

El token se obtiene al hacer login exitoso en `POST /api/auth/login`.

---

## 📁 Auth

### `POST /api/auth/register`
Registra un nuevo usuario en el sistema.

- **Acceso:** Público
- **Body:**
```json
{
  "rut": "15546114-4",
  "nombre_completo": "Francisco Octavio Segundo",
  "email": "mail@gmail.com",
  "password": "pass1234",
  "region": "Coquimbo",
  "comuna": "Canela"
}
```
- **Respuesta exitosa:** `201 Created`

---

### `POST /api/auth/login`
Inicia sesión y retorna un token JWT.

- **Acceso:** Público
- **Body:**
```json
{
  "email": "correo@gmail.com",
  "password": "tu_contraseña"
}
```
- **Respuesta exitosa:** `200 OK` + `{ token: "eyJ..." }`

---

### `POST /api/auth/logout`
Cierra la sesión del usuario autenticado.

- **Acceso:** Autenticado (Bearer Token)
- **Respuesta exitosa:** `200 OK`

---

## 📁 Citas

### `GET /api/citas/disponibilidad`
Retorna los horarios disponibles de un médico en una fecha específica.

- **Acceso:** Público
- **Query params:** `id_medico=3&fecha=2026-06-08`
- **Ejemplo:** `GET /api/citas/disponibilidad?id_medico=3&fecha=2026-06-08`
- **Respuesta exitosa:** `200 OK` + lista de horarios disponibles

---

### `GET /api/citas/mis-citas`
Lista las citas del usuario autenticado.

- **Acceso:** Autenticado (Bearer Token)
- **Respuesta exitosa:** `200 OK` + lista de citas del usuario

---

### `GET /api/citas/all` *(solo admin)*
Lista todas las citas registradas en el sistema.

- **Acceso:** Admin (Bearer Token)
- **Respuesta exitosa:** `200 OK` + lista completa de citas

---

### `GET /api/citas/:codigo`
Obtiene el detalle de una cita por su código de referencia.

- **Acceso:** Público
- **Ejemplo:** `GET /api/citas/L78CQH6B`
- **Respuesta exitosa:** `200 OK` + datos de la cita
- **Error:** `404 Not Found` si el código no existe

---

### `POST /api/citas`
Crea una nueva cita médica. Puede ser creada por un usuario autenticado o un invitado.

- **Acceso:** Público (invitado requiere rut, nombre y email)
- **Body (invitado):**
```json
{
  "id_medico": 1,
  "fecha": "08-06-2026",
  "hora": "9:00",
  "rut": "21.563.960-6",
  "nombre": "Joaquín Cornejo Fernández",
  "email": "correo@gmail.com"
}
```
- **Respuesta exitosa:** `201 Created` + código de referencia de la cita
- **Error:** `409 Conflict` si el horario ya está tomado

---

### `PATCH /api/citas/:codigo`
Actualiza la fecha y hora de una cita existente.

- **Acceso:** Autenticado (Bearer Token)
- **Ejemplo:** `PATCH /api/citas/EWF7E4MU`
- **Body:**
```json
{
  "fecha": "10-06-2026",
  "hora": "15:00"
}
```
- **Respuesta exitosa:** `200 OK` + datos actualizados de la cita
- **Error:** `409 Conflict` si el nuevo horario ya está tomado

---

### `PATCH /api/citas/:codigo/cancelar`
Cancela una cita (cambia su estado a "Cancelada"). No elimina el registro.

- **Acceso:** Autenticado u invitado (con código de referencia)
- **Ejemplo:** `PATCH /api/citas/EWF7E4MU/cancelar`
- **Respuesta exitosa:** `200 OK` + datos de la cita cancelada
- **Error:** `409 Conflict` si la cita ya estaba cancelada

---

### `DELETE /api/citas/:codigo` *(solo admin)*
Elimina permanentemente una cita de la base de datos.

- **Acceso:** Admin (Bearer Token)
- **Ejemplo:** `DELETE /api/citas/9VH3F6JX`
- **Respuesta exitosa:** `200 OK` + datos de la cita eliminada
- **Error:** `404 Not Found` si el código no existe

---

## 📁 Profesionales

### `GET /api/especialidades`
Lista todas las especialidades médicas disponibles.

- **Acceso:** Público
- **Respuesta exitosa:** `200 OK` + lista de especialidades

---

### `GET /api/especialidades/:id/medicos`
Lista los médicos que pertenecen a una especialidad.

- **Acceso:** Público
- **Ejemplo:** `GET /api/especialidades/1/medicos`
- **Respuesta exitosa:** `200 OK` + lista de médicos de esa especialidad

---

### `POST /api/profesionales` *(solo admin)*
Crea un nuevo profesional médico en el sistema.

- **Acceso:** Admin (Bearer Token)
- **Body:**
```json
{
  "rut": "19.438.337-1",
  "nombre": "Matias Fernandez",
  "id_especialidad": 3
}
```
- **Respuesta exitosa:** `201 Created` + datos del profesional creado
- **Error:** `409 Conflict` si el RUT ya está registrado
- **Error:** `400 Bad Request` si la especialidad no existe

---

### `PATCH /api/profesionales/:id` *(solo admin)*
Actualiza el nombre o especialidad de un profesional.

- **Acceso:** Admin (Bearer Token)
- **Ejemplo:** `PATCH /api/profesionales/16`
- **Body:**
```json
{
  "nombre": "Francisco Milovan",
  "id_especialidad": 1
}
```
- **Respuesta exitosa:** `200 OK` + datos actualizados del profesional
- **Error:** `404 Not Found` si el profesional no existe

---

### `DELETE /api/profesionales/:id` *(solo admin)*
Elimina un profesional del sistema.

- **Acceso:** Admin (Bearer Token)
- **Ejemplo:** `DELETE /api/profesionales/17`
- **Respuesta exitosa:** `200 OK` + datos del profesional eliminado
- **Error:** `404 Not Found` si el profesional no existe
- **Error:** `409 Conflict` si el profesional tiene citas asociadas

---

## 📁 Usuarios

### `GET /api/usuarios/me`
Retorna el perfil del usuario autenticado.

- **Acceso:** Autenticado (Bearer Token)
- **Respuesta exitosa:** `200 OK` + datos del perfil (id, rut, nombre, email, region, comuna, is_admin)

---

### `PATCH /api/usuarios/me`
Actualiza la región y/o comuna del usuario autenticado.

- **Acceso:** Autenticado (Bearer Token)
- **Body:**
```json
{
  "region": "Coquimbo",
  "comuna": "Canela"
}
```
- **Respuesta exitosa:** `200 OK` + datos actualizados del perfil

---

### `PATCH /api/usuarios/me/password`
Cambia la contraseña del usuario autenticado.

- **Acceso:** Autenticado (Bearer Token)
- **Body:**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "contraseña_nueva"
}
```
- **Respuesta exitosa:** `200 OK` + mensaje de confirmación
- **Error:** `400 Bad Request` si la contraseña actual es incorrecta

---

### `DELETE /api/usuarios/me`
Elimina la cuenta del usuario autenticado. También elimina sus citas asociadas.

- **Acceso:** Autenticado (Bearer Token)
- **Respuesta exitosa:** `200 OK` + mensaje de confirmación
- **Error:** `404 Not Found` si el usuario no existe

---

### `POST /api/usuarios/admin` *(solo admin)*
Crea un nuevo usuario con rol de administrador.

- **Acceso:** Admin (Bearer Token)
- **Body:**
```json
{
  "rut": "23870067-1",
  "nombre_completo": "Bresman Garzon Vargas",
  "email": "bresmangarzon@gmail.com",
  "password": "bresman",
  "region": "Valparaíso",
  "comuna": "Hijuelas"
}
```
- **Respuesta exitosa:** `201 Created` + datos del nuevo administrador
- **Error:** `400 Bad Request` si el RUT o email ya están registrados

---

## 📊 Resumen de Endpoints

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Público | Registrar usuario |
| POST | `/api/auth/login` | Público | Iniciar sesión |
| POST | `/api/auth/logout` | Autenticado | Cerrar sesión |
| GET | `/api/citas/disponibilidad` | Público | Ver horarios disponibles |
| GET | `/api/citas/mis-citas` | Autenticado | Ver mis citas |
| GET | `/api/citas/all` | Admin | Ver todas las citas |
| GET | `/api/citas/:codigo` | Público | Ver cita por código |
| POST | `/api/citas` | Público | Crear cita |
| PATCH | `/api/citas/:codigo` | Autenticado | Actualizar cita |
| PATCH | `/api/citas/:codigo/cancelar` | Autenticado | Cancelar cita |
| DELETE | `/api/citas/:codigo` | Admin | Eliminar cita |
| GET | `/api/especialidades` | Público | Listar especialidades |
| GET | `/api/especialidades/:id/medicos` | Público | Listar médicos por especialidad |
| POST | `/api/profesionales` | Admin | Crear profesional |
| PATCH | `/api/profesionales/:id` | Admin | Actualizar profesional |
| DELETE | `/api/profesionales/:id` | Admin | Eliminar profesional |
| GET | `/api/usuarios/me` | Autenticado | Ver perfil |
| PATCH | `/api/usuarios/me` | Autenticado | Actualizar región/comuna |
| PATCH | `/api/usuarios/me/password` | Autenticado | Cambiar contraseña |
| DELETE | `/api/usuarios/me` | Autenticado | Eliminar cuenta |
| POST | `/api/usuarios/admin` | Admin | Crear usuario admin |
