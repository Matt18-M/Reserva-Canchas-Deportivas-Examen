# 🏟️ Requerimiento de Reservas para Canchas - Examen

Sistema web para la gestión y reserva de canchas deportivas, desarrollado como proyecto académico. La aplicación permite administrar canchas, horarios, reservas y pagos, ofreciendo una plataforma intuitiva para clientes y administradores mediante un flujo completo de reservas.

---

# 📌 Características

- Autenticación mediante JWT.
- Registro e inicio de sesión.
- Gestión de usuarios con roles (Administrador y Cliente).
- CRUD de tipos de cancha.
- CRUD de canchas.
- Gestión de horarios por cancha.
- Consulta de disponibilidad en tiempo real.
- Reserva de canchas mediante un asistente paso a paso.
- Registro y administración de pagos.
- Dashboard administrativo con estadísticas.
- Historial de reservas completadas.
- Validaciones de negocio y control de acceso por roles.

---

# 🛠️ Tecnologías utilizadas

## Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Zod

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- React Query
- Axios
- React Hook Form
- Sonner
- Lucide React

---

# 📂 Estructura del proyecto

```text
Cancha-Examen/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed/
│   │
│   └── src/
│       ├── config/
│       ├── database/
│       ├── middlewares/
│       ├── modules/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
│
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── contexts/
        ├── layouts/
        ├── pages/
        ├── routes/
        ├── services/
        ├── hooks/
        ├── utils/
        └── main.tsx
```

---

# ⚙️ Instalación

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Cancha-Examen
```

---

## 2. Backend

```bash
cd backend

npm install

npx prisma migrate deploy

npm run seed

npm run dev
```

Servidor:

```
http://localhost:3001
```

---

## 3. Frontend

```bash
cd frontend

npm install

npm run dev
```

Servidor:

```
http://localhost:5173
```

---

# 🔑 Variables de entorno

## Backend (.env)

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/canchas
JWT_SECRET=tu_clave_secreta
PORT=3001
```

## Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

---

# 👤 Usuario administrador

Después de ejecutar el Seed:

| Usuario | Contraseña |
|----------|------------|
| admin@canchas.com | Admin123* |

---

# 🚀 Funcionalidades

## Área pública

- Landing Page.
- Información de las canchas.
- Registro.
- Inicio de sesión.

## Cliente

- Consultar disponibilidad.
- Reservar canchas.
- Seleccionar método de pago.
- Registrar pago.
- Consultar reservas.
- Cancelar reservas permitidas.

## Administrador

- Dashboard.
- Gestión de Usuarios.
- Gestión de Tipos de Cancha.
- Gestión de Canchas.
- Gestión de Horarios.
- Administración de Reservas.
- Historial de Reservas.
- Administración del proceso de Pagos.

---

# 📋 Flujo del sistema

```text
Cliente
    │
    ▼
Consulta disponibilidad
    │
    ▼
Selecciona cancha y horario
    │
    ▼
Elige método de pago
    │
    ▼
Se crea:
Reserva → PENDIENTE
Pago → PENDIENTE
    │
    ▼
Administrador revisa el pago
    │
 ┌──┴───────────┐
 │              │
 ▼              ▼
PAGADO      FALLIDO
 │
 ▼
Administrador confirma la reserva
 │
 ▼
Reserva CONFIRMADA
 │
 ▼
Reserva COMPLETADA
 │
 ▼
Historial
```

---

# 📚 Arquitectura

## Backend

Arquitectura modular basada en servicios.

Cada módulo contiene:

```
routes
controller
service
validation
```

Los principales módulos son:

- Auth
- Users
- Court Types
- Courts
- Schedules
- Reservations
- Payments

---

## Frontend

Arquitectura organizada por páginas y servicios.

```
Components
Layouts
Pages
Routes
Services
Contexts
```

Se utiliza React Query para el manejo de datos del servidor y React Hook Form junto con Zod para formularios y validaciones.

---

# 🗄️ Base de datos

El proyecto utiliza PostgreSQL mediante Prisma ORM.

Entidades principales:

- Rol
- Usuario
- TipoCancha
- Cancha
- Horario
- Reserva
- Pago

Relaciones:

- Un Usuario puede tener muchas Reservas.
- Una Cancha pertenece a un Tipo de Cancha.
- Una Cancha posee muchos Horarios.
- Una Cancha posee muchas Reservas.
- Una Reserva posee un único Pago.

---

# 🔒 Seguridad

- Contraseñas cifradas con bcrypt.
- Autenticación mediante JWT.
- Control de acceso por roles.
- Validaciones con Zod.
- Middleware centralizado para manejo de errores.

---

# 📈 Estado del proyecto

Actualmente el sistema incluye:

- ✅ Landing Page
- ✅ Login y Registro
- ✅ Dashboard Administrativo
- ✅ CRUD Usuarios
- ✅ CRUD Tipos de Cancha
- ✅ CRUD Canchas
- ✅ CRUD Horarios
- ✅ Disponibilidad
- ✅ Wizard de Reservas
- ✅ Mis Reservas
- ✅ Historial
- ✅ Administración de Pagos
- ✅ Gestión de Estados
- ✅ Validaciones de negocio
- ✅ Seed de datos

---

# 👨‍💻 Autor

## Mateo Molina

**Estudiante de KrakeDev - Móvilis**
