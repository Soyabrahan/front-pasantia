# Proyecto Pasantía - Guía de Instalación y Despliegue

Este documento explica paso a paso cómo instalar, configurar y desplegar el proyecto (Frontend + Backend) en un entorno de producción utilizando **PM2** y **Nginx**.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu servidor o máquina local:

- **Node.js** (v18 o superior recomendado)
- **Git**
- **Nginx** (Para servir el frontend y actuar como proxy inverso)
- **PM2** (Gestor de procesos de Node.js, se instala vía npm)

Para instalar PM2 globalmente, ejecuta:
```bash
npm install -g pm2
```

---

## 🚀 1. Instalación del Proyecto

### 1.1. Clonar el repositorio

Clona el proyecto en el directorio deseado (por ejemplo, `/var/www/pasantia`):

```bash
git clone <URL_DEL_REPOSITORIO> pasantia
cd pasantia
```

*(Nota: Asegúrate de reemplazar `<URL_DEL_REPOSITORIO>` por la URL real de tu Git).*

### 1.2. Instalar dependencias del Backend

El backend está desarrollado con NestJS.

```bash
cd backend_pasantia
npm install
```

**Configuración de Variables de Entorno (Backend):**
Debes crear un archivo `.env` en la carpeta `backend_pasantia`:
```bash
# Dentro de backend_pasantia/
echo "JWT_SECRET=super-secret-key-pasantia-2026" > .env
echo "PORT=3001" >> .env
```
*(Asegúrate de cambiar el `JWT_SECRET` por uno más seguro en producción).*

### 1.3. Instalar dependencias del Frontend y compilar

El frontend está desarrollado con Next.js y configurado para exportación estática (`output: 'export'`).

```bash
cd ../front-pasantia
npm install

# Compilar el proyecto estático
npm run build
```
Esto generará una carpeta llamada `out` dentro de `front-pasantia` que contiene los archivos estáticos listos para ser servidos por Nginx.

---

## ⚙️ 2. Despliegue del Backend con PM2

Para mantener el backend ejecutándose en segundo plano y que se reinicie automáticamente si falla o si el servidor se reinicia, usaremos PM2.

```bash
cd ../backend_pasantia

# Compilar el backend
npm run build

# Iniciar el backend con PM2
pm2 start dist/main.js --name "backend-pasantia"

# Guardar la lista de procesos para que PM2 los levante al reiniciar el servidor
pm2 save

# Configurar PM2 para que inicie con el sistema operativo (sigue las instrucciones que te dé el comando)
pm2 startup
```

Para verificar que el backend está corriendo:
```bash
pm2 status
pm2 logs backend-pasantia
```

---

## 🌐 3. Configuración de Nginx

Nginx se encargará de dos cosas:
1. Servir los archivos estáticos del Frontend (la carpeta `out`).
2. Redirigir (Reverse Proxy) las peticiones de `/api` hacia nuestro Backend gestionado por PM2 (puerto 3001).

### 3.1. Crear el archivo de configuración

Crea o edita un archivo de configuración en Nginx (dependiendo de tu SO, suele estar en `/etc/nginx/sites-available/pasantia` o `/etc/nginx/conf.d/pasantia.conf`).

```nginx
server {
    listen 80;
    server_name tu_dominio_o_ip; # Ej: 192.168.1.7 o pasantia.midominio.com

    # 1. Servir el Frontend estático
    location / {
        # Cambia esta ruta a la ubicación real de tu proyecto
        root /ruta/absoluta/a/pasantia/front-pasantia/out; 
        index index.html index.htm;
        
        # Necesario para que funcionen las rutas de Next.js
        try_files $uri $uri.html $uri/ /index.html;
    }

    # 2. Proxy inverso para el Backend (NestJS)
    location /api/ {
        # El backend corre en el puerto 3001
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

**Puntos clave del archivo Nginx:**
- `root /ruta/absoluta/a/pasantia/front-pasantia/out;`: Asegúrate de colocar la ruta **absoluta** de tu servidor donde clonaste el repo.
- `proxy_pass http://127.0.0.1:3001/;`: La barra final `/` es importante porque elimina el prefijo `/api` antes de pasarlo al backend (ej: `/api/auth/login` llega como `/auth/login` al backend).

### 3.2. Habilitar el sitio y reiniciar Nginx

Si estás en Ubuntu/Debian:
```bash
# Crear un enlace simbólico para habilitar el sitio
sudo ln -s /etc/nginx/sites-available/pasantia /etc/nginx/sites-enabled/

# Verificar que la configuración sea correcta
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

¡Listo! Con esto tu proyecto ya debería estar accesible desde tu IP o dominio, mostrando el frontend con Next.js y comunicándose correctamente con tu backend de NestJS a través de `/api`.
