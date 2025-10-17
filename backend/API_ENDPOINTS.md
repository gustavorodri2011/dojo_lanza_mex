# API Endpoints - Dojo Manager

## Base URL
```
http://localhost:5000/api
```

## Autenticación
Todos los endpoints (excepto login y health) requieren token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticación

### POST /auth/login
Autentica un usuario y devuelve token JWT.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@dojo.com"
  }
}
```

### GET /auth/profile
Obtiene el perfil del usuario autenticado.

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@dojo.com"
  }
}
```

---

## 👥 Miembros

### GET /members
Obtiene lista de miembros con filtros opcionales.

**Query Parameters:**
- `search` (string): Búsqueda por nombre o apellido
- `belt` (string): Filtro por cinturón (blanco, amarillo, naranja, verde, azul, marron, negro)
- `active` (boolean): Filtro por estado activo (true/false)

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "phone": "123456789",
    "dateOfBirth": "1990-01-15",
    "joinDate": "2024-01-01",
    "belt": "azul",
    "isActive": true,
    "notes": "Notas del miembro",
    "payments": [
      {
        "id": 1,
        "amount": "50.00",
        "paymentDate": "2024-10-01",
        "monthYear": "2024-10"
      }
    ]
  }
]
```

### GET /members/:id
Obtiene un miembro específico por ID.

**Response:**
```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "123456789",
  "dateOfBirth": "1990-01-15",
  "joinDate": "2024-01-01",
  "belt": "azul",
  "isActive": true,
  "notes": "Notas del miembro",
  "payments": [
    {
      "id": 1,
      "amount": "50.00",
      "paymentDate": "2024-10-01",
      "monthYear": "2024-10",
      "paymentMethod": "efectivo",
      "receiptNumber": "REC-1697123456789"
    }
  ]
}
```

### POST /members
Crea un nuevo miembro.

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "123456789",
  "dateOfBirth": "1990-01-15",
  "joinDate": "2024-01-01",
  "belt": "blanco",
  "isActive": true,
  "notes": "Notas opcionales"
}
```

**Response:**
```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "123456789",
  "dateOfBirth": "1990-01-15",
  "joinDate": "2024-01-01",
  "belt": "blanco",
  "isActive": true,
  "notes": "Notas opcionales",
  "createdAt": "2024-10-16T10:30:00.000Z",
  "updatedAt": "2024-10-16T10:30:00.000Z"
}
```

### PUT /members/:id
Actualiza un miembro existente.

**Body:** (campos opcionales)
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "belt": "amarillo",
  "isActive": false
}
```

**Response:**
```json
{
  "id": 1,
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "email": "juan@example.com",
  "phone": "123456789",
  "dateOfBirth": "1990-01-15",
  "joinDate": "2024-01-01",
  "belt": "amarillo",
  "isActive": false,
  "notes": "Notas opcionales",
  "createdAt": "2024-10-16T10:30:00.000Z",
  "updatedAt": "2024-10-16T11:00:00.000Z"
}
```

### DELETE /members/:id
Elimina un miembro.

**Response:**
```json
{
  "message": "Member deleted successfully"
}
```

---

## 💰 Pagos

### GET /payments
Obtiene lista de pagos con filtros opcionales.

**Query Parameters:**
- `memberId` (number): Filtro por ID de miembro
- `month` (string): Filtro por mes (01-12)
- `year` (string): Filtro por año (YYYY)

**Response:**
```json
[
  {
    "id": 1,
    "memberId": 1,
    "amount": "50.00",
    "paymentDate": "2024-10-01",
    "monthYear": "2024-10",
    "paymentMethod": "efectivo",
    "notes": "Pago mensual",
    "receiptNumber": "REC-1697123456789",
    "member": {
      "firstName": "Juan",
      "lastName": "Pérez"
    }
  }
]
```

### POST /payments
Registra un nuevo pago.

**Body:**
```json
{
  "memberId": 1,
  "amount": 50.00,
  "monthYear": "2024-10",
  "paymentMethod": "efectivo",
  "notes": "Pago mensual octubre"
}
```

**Response:**
```json
{
  "id": 1,
  "memberId": 1,
  "amount": "50.00",
  "paymentDate": "2024-10-16",
  "monthYear": "2024-10",
  "paymentMethod": "efectivo",
  "notes": "Pago mensual octubre",
  "receiptNumber": "REC-1697123456789",
  "member": {
    "firstName": "Juan",
    "lastName": "Pérez"
  }
}
```

### GET /payments/overdue
Obtiene miembros con pagos atrasados del mes actual.

**Response:**
```json
[
  {
    "id": 2,
    "firstName": "María",
    "lastName": "González",
    "email": "maria@example.com",
    "phone": "987654321",
    "joinDate": "2024-01-15",
    "belt": "verde",
    "isActive": true,
    "payments": []
  }
]
```

### GET /payments/:id/receipt
Genera y descarga el recibo PDF de un pago específico.

**Parameters:**
- `id` (number): ID del pago

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="recibo-{receiptNumber}.pdf"`
- Body: Archivo PDF del recibo

**Contenido del PDF:**
- Encabezado del dojo
- Información del miembro
- Detalles del pago
- Número de recibo
- Fecha y monto

---

## 🏥 Health Check

### GET /health
Verifica el estado de la API.

**Response:**
```json
{
  "status": "OK",
  "message": "Dojo API is running",
  "timestamp": "2024-10-16T10:30:00.000Z"
}
```

---

## 🔒 Seguridad y Encriptación

### Campos Encriptados
Los siguientes campos se almacenan encriptados en la base de datos:
- `firstName` (nombre)
- `lastName` (apellido)
- `phone` (teléfono)
- `notes` (notas)

### Campos No Encriptados
- `email` (correo electrónico)
- Todos los demás campos del sistema

### Autenticación
- Todas las rutas (excepto `/auth/login` y `/health`) requieren autenticación JWT
- El token debe enviarse en el header `Authorization: Bearer <token>`
- Los tokens expiran según la configuración `JWT_EXPIRES_IN` (por defecto 7 días)

---

## 📝 Códigos de Error

- `200` - OK
- `201` - Created
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (token inválido o faltante)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error

---

**Última actualización:** 16 de Octubre, 2024

## 📄 Generación de PDFs

### Recibos de Pago
Los recibos PDF incluyen:
- Logo y nombre del dojo
- Datos del miembro (desencriptados)
- Información completa del pago
- Número de recibo único
- Formato profesional para impresión