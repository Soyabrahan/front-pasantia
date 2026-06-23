# FERPASES - Manual Técnico de Instalación y Despliegue

Sistema de gestión de pases para materiales y misceláneos de CVG Ferrominera Orinoco.

## Requisitos del Sistema

| Componente | Versión Mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |
| PostgreSQL | 15 |
| Nginx | Cualquier versión estable |
| PM2 | Última (instalar global) |
| Docker (opcional) | 24.x |

```bash
npm install -g pm2
```

---

## 1. Backend (NestJS)

### 1.1 Estructura

```
backend_pasantia/
├── src/              # Código fuente TypeScript
├── dist/             # Compilado (generado con npm run build)
├── .env              # Variables de entorno
└── docker-compose.yml
```

### 1.2 Variables de Entorno

Archivo `backend_pasantia/.env`:

```env
JWT_SECRET=super-secret-key-pasantia-2026
PORT=3001
```

### 1.3 Base de Datos

Opción A - Docker (recomendado):

```bash
cd backend_pasantia
docker-compose up -d
```

Esto levanta PostgreSQL 15 en el puerto configurado con las credenciales del `docker-compose.yml`.

Opción B - Instalación directa:
Instala PostgreSQL 15 y crea la base de datos manualmente. Configura las credenciales en el archivo `.env` del backend según lo que espere `data-source.ts` de TypeORM.

### 1.4 Compilar e Iniciar

```bash
cd backend_pasantia

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar con PM2 (producción)
pm2 start dist/main.js --name "backend-pasantia"

# Ver logs
pm2 logs backend-pasantia

# Persistir y auto-inicio
pm2 save
pm2 startup
```

El backend corre en `http://localhost:3001`.

---

## 2. Frontend (Next.js + Electron)

### 2.1 Estructura

```
front-pasantia/
├── app/              # Páginas y rutas Next.js
├── components/       # Componentes React
├── lib/              # Utilidades
├── public/           # Estáticos
├── main.js           # Entry point de Electron
├── out/              # Build estático (generado con npm run build)
├── dist/             # Ejecutable Electron (generado con npm run package)
└── .env              # Variable NEXT_PUBLIC_API_URL
```

### 2.2 Variables de Entorno

Archivo `front-pasantia/.env`:

```env
NEXT_PUBLIC_API_URL=http://10.200.17.185:3001
```

> **Importante:** Esta URL debe apuntar al servidor donde corre el backend. En producción, si usas Nginx como proxy reverso, debe ser la IP pública del servidor (ej: `http://192.168.1.100:3001`). En desarrollo local apunta a `localhost:3001`.

### 2.3 Despliegue Web (Nginx + Static Export)

```bash
cd front-pasantia

# Instalar dependencias
npm install

# Compilar exportación estática
npm run build
# Genera la carpeta out/ con HTML, CSS y JS estáticos
```

Configuración de Nginx (`/etc/nginx/sites-available/pasantia`):

```nginx
server {
    listen 80;
    server_name tu_ip_o_dominio;

    location / {
        root /ruta/absoluta/a/front-pasantia/out;
        index index.html;
        try_files $uri $uri.html $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar y reiniciar:

```bash
sudo ln -s /etc/nginx/sites-available/pasantia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2.4 Despliegue Escritorio (Electron)

#### Build del ejecutable

```bash
cd front-pasantia

# Compilar el frontend
npm run build

# Empaquetar para Linux (.deb)
npm run package

# Empaquetar para Windows (.exe portable)
npm run package:win
```

Los ejecutables se generan en:
- Linux: `dist/FerroPases-1.0.0.deb`
- Windows: `dist/FerroPases-1.0.0.exe`

#### Modo desarrollo con Electron

```bash
# Terminal 1 - Servidor Next.js
npm run dev

# Terminal 2 - Ventana Electron (espera al puerto 3000)
npm run electron:dev
```

#### Arquitectura de la app Electron

El archivo `main.js` funciona así:

- **Producción** (`app.isPackaged = true`):
  - Carga los archivos estáticos desde `out/` usando `electron-serve`
  - Desactiva el menú superior y el DevTools (Ctrl+Shift+I lo reactiva)
- **Desarrollo** (`app.isPackaged = false`):
  - Carga `http://localhost:3000` (Next.js dev server)
  - Abre DevTools automáticamente

> La aceleración por hardware está deshabilitada para evitar pantallas negras en Linux.

---

## 3. Flujo de Despliegue Completo (Nuevo Servidor)

```bash
# 1. Clonar repositorio
git clone <URL_DEL_REPO> pasantia
cd pasantia

# 2. Backend
cd backend_pasantia
cp .env.example .env          # o crea el .env manualmente
npm install
docker-compose up -d           # levanta PostgreSQL
npm run build
pm2 start dist/main.js --name "backend-pasantia"
pm2 save

# 3. Frontend
cd ../front-pasantia
npm install
npm run build
# Configura Nginx con el archivo de ejemplo de arriba
sudo systemctl restart nginx
```

---

## 4. Comandos Útiles

### PM2

```bash
pm2 status                    # Ver estado de todos los procesos
pm2 logs backend-pasantia     # Ver logs del backend
pm2 restart backend-pasantia  # Reiniciar
pm2 stop backend-pasantia     # Detener
pm2 delete backend-pasantia   # Eliminar del listado
pm2 save                      # Guardar lista actual para reinicios
pm2 startup                   # Generar script de auto-inicio
```

### Frontend

```bash
npm run dev                   # Servidor de desarrollo (con hot reload)
npm run build                 # Compilar exportación estática
npm run start                 # Servir out/ con serve (prueba local)
npm run package               # Empaquetar Electron para Linux
npm run package:win           # Empaquetar Electron para Windows
```

---

## 5. Solución de Problemas

| Problema | Causa | Solución |
|---|---|---|
| Backend no responde | Puerto ocupado | `pm2 logs backend-pasantia` o cambia `PORT` en `.env` |
| Frontend en blanco | API URL incorrecta | Verifica `NEXT_PUBLIC_API_URL` en `.env` |
| Nginx 502 Bad Gateway | Backend caído | `pm2 restart backend-pasantia` |
| Error `EPERM` en node_modules | Permisos | Ejecuta como administrador o `npm cache clean --force && npm install` |
| PostgreSQL no conecta | Docker caído | `docker ps` para verificar el contenedor |
| Electron pantalla negra | Aceleración HW | Ya deshabilitada en `main.js`; si persiste, agrega `--disable-gpu` |



© 2026 CVG Ferrominera Orinoco - Sistema de Gestión de Pases
