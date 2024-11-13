# loginOauth
# Sistema de Login con Node.js y MariaDB

Este proyecto implementa un sistema de autenticación utilizando Node.js como backend y MariaDB como base de datos. Incluye registro de usuarios, inicio de sesión y gestión de sesiones.

## Requisitos Previos

- Node.js (v14 o superior)
- MariaDB (v10.5 o superior)
- npm (administrador de paquetes de Node.js)

## Tecnologías Utilizadas

- **Backend**: Node.js y Express
- **Base de Datos**: MariaDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: bcrypt para hash de contraseñas
- **Validación**: express-validator

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd nombre-del-proyecto
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar las variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto
   - Copiar el contenido de `.env.example` y configurar las variables:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
JWT_SECRET=tu_secreto_jwt
```

4. Inicializar la base de datos:
```bash
mysql -u root -p < database/schema.sql
```

## Estructura del Proyecto

```
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   └── app.js
├── database/
│   └── schema.sql
└── server.js
```

## Endpoints API

### Autenticación

- **POST /api/auth/register**
  - Registro de nuevo usuario
  - Body: `{ "username": "string", "email": "string", "password": "string" }`

- **POST /api/auth/login**
  - Inicio de sesión
  - Body: `{ "email": "string", "password": "string" }`

- **GET /api/auth/profile**
  - Obtener perfil del usuario autenticado
  - Requiere token JWT

### Usuarios

- **GET /api/users**
  - Listar usuarios (requiere autenticación)
- **GET /api/users/:id**
  - Obtener usuario por ID (requiere autenticación)

## Seguridad

- Passwords hasheados con bcrypt
- Protección contra inyección SQL usando consultas preparadas
- Validación de datos de entrada
- Tokens JWT para sesiones
- Headers de seguridad con helmet
- Rate limiting para prevenir ataques de fuerza bruta

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.