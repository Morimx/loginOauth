
# ABM - Autenticación y Gestión de Usuarios

Este proyecto es una aplicación Node.js para la autenticación y gestión de usuarios, utilizando estrategias como Google OAuth, Microsoft, y autenticación local. También soporta autenticación de dos factores (2FA).

## Características

- **Autenticación**: Soporte para Google, Microsoft, y autenticación local.
- **Autenticación de dos factores (2FA)**: Implementado mediante la biblioteca `otpauth`.
- **Sesiones**: Gestión de sesiones con `express-session`.
- **Frontend**: Plantillas dinámicas renderizadas con `EJS`.
- **Base de datos**: Integración con MySQL para almacenamiento de datos.

## Instalación

1. Clona este repositorio:
    ```bash
    git clone <URL-del-repositorio>
    cd loginOauth
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Crea un archivo `.env` en el directorio raíz y configura las siguientes variables de entorno:
    ```env
    PORT=3000
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_NAME=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    MICROSOFT_CLIENT_ID=
    MICROSOFT_CLIENT_SECRET=
    SESSION_SECRET=
    ```

4. Asegúrate de tener una base de datos MySQL configurada y actualiza las credenciales en el archivo `.env`. ademas los querys para crear las tablas en la base son:

CREATE TABLE iframes (
    id INT NOT NULL AUTO_INCREMENT,
    domain VARCHAR(255),
    iframe_baja VARCHAR(255),
    iframe_alta VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB
  AUTO_INCREMENT=4
  DEFAULT CHARSET=latin1
  COLLATE=latin1_swedish_ci;

CREATE TABLE user_logs (
    id INT NOT NULL AUTO_INCREMENT,
    action_type ENUM('login', 'permission_change'),
    user_id INT NOT NULL,
    target_user_id INT,
    action_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY (user_id),
    KEY (target_user_id)
) ENGINE=InnoDB
  AUTO_INCREMENT=184
  DEFAULT CHARSET=latin1
  COLLATE=latin1_swedish_ci;

CREATE TABLE usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    platform_id VARCHAR(255),
    bajas TINYINT(1),
    display_name VARCHAR(100),
    is_admin TINYINT(1),
    altas TINYINT(1),
    two_factor_secret VARCHAR(255),
    two_factor_enabled TINYINT(1),
    PRIMARY KEY (id)
) ENGINE=InnoDB
  AUTO_INCREMENT=16
  DEFAULT CHARSET=latin1
  COLLATE=latin1_swedish_ci;

## Uso

1. Inicia la aplicación:
    ```bash
    node app.js
    ```

2. Abre tu navegador y ve a `http://localhost:3000`.

## Dependencias

Las principales dependencias del proyecto incluyen:

- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [ejs](https://www.npmjs.com/package/ejs)
- [express](https://www.npmjs.com/package/express)
- [passport](https://www.npmjs.com/package/passport)
- [mysql2](https://www.npmjs.com/package/mysql2)

Consulta el archivo `package.json` para obtener una lista completa de las dependencias.

## Contribución

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad (`git checkout -b nueva-funcionalidad`).
3. Haz un commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`).
4. Haz un push a la rama (`git push origin nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está licenciado bajo la licencia ISC.
