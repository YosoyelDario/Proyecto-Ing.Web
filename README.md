# Listas de espera y tiempos de atención excesivos
## EP 1.1
| Requerimientos Funcionales  | Requerimientos No Funcionales |
| ------------- |:-------------:|
| RF 1: El usuario puede agendar una cita médica, iniciando o no sesión      | RNF 1: El sistema debe poseer una alta facilidad de uso, garantizando que el tiempo de capacitación (o de familiarización) necesario para que un usuario inexperto logre agendar una cita por primera vez sea inferior a 3 minutos     |
| RF 2: El usuario es capaz de consultar su cita médica en la página web a través de un código referido único      | RNF 2: El sistema debe tener un tiempo de respuesta inferior a 10 segundos al momento en que el usuario consulta su cita médica con el código de referido.     |
| RF 3: El usuario es capaz de modificar su cita médica      | RNF 3: El sistema debe garantizar una probabilidad de no disponibilidad inferior al 1% para asegurar que tanto pacientes como administradores tengan acceso continuo a la modificación y cancelación de citas.     |
| RF 4: El usuario es capaz de cancelar su cita médica      |      |
| RF 5: El sistema debe notificar mediante correo electrónico (si el usuario lo proporciona), su cita médica (confirmación o cancelación por el médico).      |      |
| RF 6: El sistema debe contar con un panel administrativo que permite modificar las citas si el médico no se encuentra disponible, así como modificar la cita del usuario.      |      |
| RF 7: El sistema debe comprobar que la cita ha sido agendada correctamente para evitar duplicaciones.      | |


## EP 1.2  Justificacion del problema y analisis del usuario objetivo.
#### Justificacion del problema
Segun la informacion proporcionada respecto a la situacion actual con las citas medicas es la siguiente _**"Los usuarios deben esperar meses para consultas o exámenes debido a la
sobredemanda y falta de organización"**_, El sistema (la pagina web) propone eliminar cuellos de botella administrativos a través de la centralización de datos y la visualización de disponibilidad en tiempo real, garantizando un flujo de agendamiento ordenado y la reducción de tiempos de espera.

#### Analisis del usuario objetivo
El Usuario objetivo que nosotros determinamos, es un usuario general. El cual por lo general no esta experimentado para realizar citas medicas de manera online, sino que provienen de un sistema el cual era algo mas manual e humano, por lo que el diseño tiene que dar prioridad a la previsibilidad y a la disminución de pasos lógicos, eliminando la fricción procedimental para que una persona sin experiencia pueda finalizar el proceso de programación de manera independiente y sin ambigüedad técnica.

## EP 1.3

QUE HAY QUE HACER: Bocetos de UI/UX y prototipo en Figma de al menos 7 mockups o pantallas distintas, cada una correspondiente
a una funcionalidad previamente definida en los requerimientos
del proyecto. Cada pantalla deber´a presentar un dise˜no diferenciado, coherente con el flujo de navegaci´on y la jerarqu´ıa de informaci´on. Las interfaces deber´as ser prototipadas considerando
expl´ıcitamente: versi´on m´ovil y web. El dise˜no deber´a evidenciar
distribuci´on de contenido, componentes de navegaci´on (por ejemplo: men´u lateral en web, barra inferior en m´ovil), jerarqu´ıa visual
y densidad de la informaci´on. Se deber´a Incluir en los mockups
dos formularios relacionados al inicio de sesi´on de usuarios y registro, considerando los campos: Nombre de usuario, RUT, Correo Electr´onico, Regi´on, Comuna, Contrase˜na, Confirmaci´on de
Contrase˜na y aceptaci´on de t´erminos y condiciones. Considerando
validaciones visuales y dise˜no centrado en el usuario.

## EP 1.4

Definici´on de Arquitectura de Navegaci´on y Experiencia
del Usuario. El equipo deber´a definir la arquitectura de navegaci´on de la aplicaci´on, describiendo la estructura de rutas, jerarqu´ıa de vistas, y flujo de interacci´on entre pantallas. La entrega
deber´a incluir: (a) Rutas principales y secundarias; (b) Relaciones
jer´arquicas entre vistas; (c) Flujo de navegaci´on entre funcionalidades; (d) diferenciaci´on de acceso seg´un roles (por ejemplo: usuario /administrador); (e) flujo de principales tareas (task flow), (f)
puntos cr´ıticos de interacci´on; (g) coherencia de experiencia entre
3
dispositivos; (h) breve justificaci´on t´ecnica de las decisiones adoptadas, considerando usabilidad, eficiencia de interacci´on, claridad
estructural y escalabilidad de la arquitectura frontend.

## EP 1.5

 Creaci´on del proyecto en Ionic con React, considerando:
(a) Uso de react router; (b) Rutas p´ublicas y rutas protegidas; (c)
Redirecciones (ejemplo: login obligatorio); (d) Estructura modular
de vistas.


## EP 1.6
Disenoo de pantallas principales e incorporando una estructura de navegaci´on funcional y coherente con la arquitectura
previamente definida en ionic-react (al menos 4). Uso de componentes propios de Ionic (IonPage, IonHeader, IonContent, IonTabs, IonMenu, etc). Separaci´on estructural del c´odigo en carpetas
(pages, components, routes, services).
