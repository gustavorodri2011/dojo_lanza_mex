# 🚀 Deploy en Render

## Pasos para deploy:

### 1. Crear cuenta en Render
- Ir a https://render.com
- Registrarse con GitHub

### 2. Crear PostgreSQL Database
1. Dashboard → New → PostgreSQL
2. Name: `dojo-database`
3. Database: `dojo_db`
4. User: `dojo_user`
5. Region: Oregon (US West)
6. Plan: Free
7. Create Database

### 3. Crear Backend Web Service
1. Dashboard → New → Web Service
2. Connect GitHub repository: `gustavorodri2011/dojo_lanza_mex`
3. Name: `dojo-backend`
4. Root Directory: `backend`
5. Environment: Node
6. Build Command: `pnpm install`
7. Start Command: `pnpm start`
8. Plan: Free

**Variables de entorno del backend:**
```
NODE_ENV=production
PORT=10000
DB_HOST=[Internal Database URL from step 2]
DB_PORT=5432
DB_NAME=dojo_db
DB_USER=[Database User from step 2]
DB_PASSWORD=[Database Password from step 2]
JWT_SECRET=tu-clave-jwt-super-secreta-para-produccion
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=tu-clave-de-32-caracteres-para-encriptacion
```

### 4. Crear Frontend Static Site
1. Dashboard → New → Static Site
2. Connect GitHub repository: `gustavorodri2011/dojo_lanza_mex`
3. Name: `dojo-frontend`
4. Root Directory: `frontend`
5. Build Command: `pnpm install && pnpm build`
6. Publish Directory: `dist`

**Variables de entorno del frontend:**
```
VITE_API_URL=https://dojo-backend.onrender.com/api
```

### 5. Orden de deploy:
1. ✅ Database (primero)
2. ✅ Backend (segundo, usar DB URL)
3. ✅ Frontend (tercero, usar Backend URL)

### 6. URLs finales:
- Frontend: `https://dojo-frontend.onrender.com`
- Backend: `https://dojo-backend.onrender.com`
- Database: Internal URL only

## ⚠️ Notas importantes:
- El backend se "duerme" después de 15 min de inactividad
- Primera carga puede tardar 30-60 segundos
- PostgreSQL gratuito: 1GB storage máximo