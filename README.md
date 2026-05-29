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

## [EP 2.2] Configuración y modelado de la base de datos

Se diseñó y modeló una base de datos relacional normalizada en el motor ... que garantiza integridad de datos, escalabilidad y rastrabilidad de operaciones.

[![Modelo Relacional BD](DiagramaBaseFinal.png)](https://github.com/YosoyelDario/Proyecto-Ing.Web/blob/Rama-Vicho/DiagramaBaseFinal.png?raw=true)

Se modeló la BD a usar considerando 8 entidades como se observa en el modelo relacional. Algunas de las decisiones claves tomadas fueron:
* **Calendario flexible:** Se usó un modelo de horarios recurrentes al cual se le pueden agregar excepciones puntuales (feriados, permisos, licencias, etc).
* **Código de referencia para citas:** Se usara un formato `YYMMDDCCC` de codigo auto-generado para entregar un codigo referencial a los pacientes diferente al id interno.
* **Trazabilidad de cambios:** Se implementó la entidadd cambiosCita cuyo objetivo es llevar trazabilidad total de quién, cuándo y qué se cambio en el sistema.
