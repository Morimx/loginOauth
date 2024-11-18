
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

4. Asegúrate de tener una base de datos MySQL configurada y actualiza las credenciales en el archivo `.env`.

## Uso

1. Inicia la aplicación:
    ```bash
    npm start
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
