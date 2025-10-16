# 🥋 Dojo Manager

Sistema de gestión de cuotas para dojos de karate desarrollado con React, Node.js y PostgreSQL.

## 🚀 Características

- **Gestión de Miembros**: CRUD completo con datos encriptados
- **Registro de Pagos**: Control de cuotas mensuales
- **Dashboard**: Estadísticas y miembros con pagos atrasados
- **Autenticación JWT**: Sistema seguro de login
- **Encriptación**: Datos sensibles protegidos con AES-256
- **Interfaz Moderna**: React con Tailwind CSS y SweetAlert2

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT para autenticación
- Encriptación AES-256
- Validaciones con express-validator

### Frontend
- React 19 + Vite
- Tailwind CSS
- React Router
- Axios
- SweetAlert2

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- pnpm (recomendado)

## 🚀 Instalación

### 1. Clonar repositorio
```bash
git clone <repository-url>
cd DojoLM
```

### 2. Backend Setup
```bash
cd backend
pnpm install
```

### 3. Base de Datos
```bash
# Usando Docker (recomendado)
docker-compose up -d

# O configurar PostgreSQL manualmente
# Crear base de datos: dojo_db
```

### 4. Variables de Entorno
```bash
# Copiar y configurar .env en backend/
cp .env.example .env
```

### 5. Frontend Setup
```bash
cd frontend
pnpm install
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
# Terminal 1 - Backend
cd backend
pnpm run dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

### Acceso
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Usuario por defecto: `admin` / `admin123`

## 📚 Documentación API

Ver [API_ENDPOINTS.md](backend/API_ENDPOINTS.md) para documentación completa de endpoints.

## 🔒 Seguridad

- Datos sensibles encriptados (nombres, teléfonos, notas)
- Autenticación JWT con expiración
- Validación de datos en backend
- Protección CORS y Helmet

## 🗂️ Estructura del Proyecto

```
DojoLM/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── API_ENDPOINTS.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
└── docker-compose.yml
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado para la gestión eficiente de dojos de karate.