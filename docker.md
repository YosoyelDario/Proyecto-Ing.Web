# Despliegue con Docker — Municipalidad Santo Domingo

## Estructura de archivos requerida

Colocar los archivos de la siguiente manera en la raíz del repositorio:

```
Proyecto-Ing.Web-main/
├── backend.Dockerfile        ← Dockerfile del backend
├── frontend.Dockerfile       ← Dockerfile del frontend
├── nginx.conf                ← Configuración nginx para la SPA
├── docker-compose.yml        ← Orquestación de servicios
├── backend/
│   └── ...
├── frontend/
│   └── ...
└── base de datos/
    └── init.sql              ← Se ejecuta automáticamente al primer arranque
```

## Requisitos previos

- Docker Desktop instalado y corriendo
- Puerto 3000, 5173 y 5433 disponibles en la máquina

## Levantar los servicios

```bash
# Desde la raíz del proyecto (donde está docker-compose.yml)
docker compose up --build
```

La primera vez descarga imágenes y compila el frontend (~2-3 minutos).
Las siguientes veces es mucho más rápido gracias al caché de Docker.

## Acceso

| Servicio  | URL                       |
|-----------|---------------------------|
| Frontend  | http://localhost:5173     |
| Backend   | http://localhost:3000     |
| PostgreSQL| localhost:5432            |

## Detener los servicios

```bash
docker compose down
```

Para detener **y borrar los datos** de la base de datos:

```bash
docker compose down -v
```

## Levantar solo un servicio (útil para debug)

```bash
docker compose up db           # solo PostgreSQL
docker compose up backend      # backend + db
docker compose logs -f backend # ver logs en tiempo real
```

## Variables de entorno

Las variables sensibles están en `docker-compose.yml`. Para producción real
se recomienda moverlas a un archivo `.env` en la raíz:

```env
POSTGRES_PASSWORD=contraseña_segura
JWT_SECRET=clave_muy_larga_y_aleatoria
SMTP_USER=correo@gmail.com
SMTP_PASS=clave_de_aplicacion_gmail
```

Y referenciarlas en `docker-compose.yml` con `${VARIABLE}`.

## Notas técnicas

- La base de datos se inicializa automáticamente con `init.sql` solo si el
  volumen `postgres_data` está vacío (primer arranque).
- El backend espera a que PostgreSQL esté saludable antes de iniciar
  (`healthcheck` + `depends_on: condition: service_healthy`).
- El frontend se sirve como build estático de Vite a través de nginx.
  nginx redirige todas las rutas a `index.html` para que React Router
  funcione correctamente al recargar la página.
- `VITE_API_URL` se inyecta en tiempo de build (no en runtime), por lo que
  cualquier cambio requiere reconstruir la imagen del frontend.