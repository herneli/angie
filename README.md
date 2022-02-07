# ANGIE &middot; Angie's Next Generation Integration Engine

> middleware | integrations | hl7 | comunications | camel

Proyecto utilizado para el control de la mensajería entre diferentes sistemas. Este proyecto tiene como objetivo servir como configurador y backend para el proyecto 'JUM-Angie' (camel based).

## Pre-requisitos

NodeJS 12.XX o superior

```javascript
//Es necesario tener un usuario en el registro de landra
> npm login


> npm install
```

Generar las claves de privadas:

```
> node .\execute.js --generateKeys
```

Copiar el archivo `.env.sample` a `.env` y establecer las claves generadas anteriormente en `CRYPT_IV` y `CRYPT_SECRET`.

> **Es importante no perder estas claves ya que se utilizan para la encriptación de ciertas cadenas en la aplicación y sin ellas no podrán ser desencriptadas.**

Generar secret para JUM-Agents:

```
> node .\execute.js --jumSecret
```

Establecer la clave generada anteriormente en `JUM_AGENTS_SECRET` dentro del archivo `.env`.

## Docker Environment

Necesario disponer de docker instalado en el sistema el cual creará los contenedores: PostgreSQL, RabbitMQ, Kibana y ElasticSearch.

El arranque y creación de estos sistemas se realiza mediante:

```
$:angie-docker> docker-compose up
```

También se puede instalar la extensión docker y docker-compose en vscode para facilitar la monitorización.

Los puertos en los que se encuentra, por defecto, cada componente son:

-   PostgreSQL: 3132
-   RabbitMQ: 3111 y 3112(management)
-   ElasticSearch: 3103
-   Kibana: 3108
-   Keycloak: 3114

_**Nota:** en determinados entornos el script de `dbinit/01-init.sh` de postgre no funciona correctamente. En entornos Linux/Mac es necesario dar permisos (chmod 777) y en windows cambiar el tipo de salto de línea a LF._

### Optimización

Es importante, en windows, activar WSL2 para mejorar el rendimiento de Docker. Adicionalmente, para evitar que consuma demasiada ram se puede crear un archivo `.wslconfig` en `C:\Users\[user]` con el siguiente contenido:

```
[wsl2]
memory=3GB   # Limits VM memory in WSL 2 up to 3GB
processors=2 # Makes the WSL 2 VM use two virtual processors
```

Con 3 Gb es suficiente para los contenedores actuales.

> Despues de aplicar esta configuración es necesario reiniciar.

## Ejecutando la aplicación

Ejecutar el servidor

```shell
> npm run view
> node execute.js
```

Este comando cargará la base de datos y demás componentes necesarios para el funcionamiento de la aplicación. Iniciará la escucha en los puertos:

-   3105

### Desarrollo

En el archivo `knexfile.js` se establecen las propiedades de acceso a la base de datos. **Se recomienda mantener las configuraciones y utilizar los contenedores proporcionados para mantener un entorno uniforme.**

### Database Migration

Up:

```
> node knex-cli.js migrate:latest  --env development
```

Down:

```
> node knex-cli.js migrate:rollback  --env development
```

`knex-cli` es un acceso rápido a la librería knex para poderlo ejecutar aunque la dependencia no se encuentre instalada en el sistema. Se utiliza exactamente igual que Knex. Mas info: https://knexjs.org/#Migrations-CLI

Para crear nuevas migraciones:

```
> node knex-cli.js  migrate:make migration_name
```

#### Database Seeds

Los ficheros de seed para rellenar tablas de la base de datos se ejecutan mediante:

```
> node knex-cli.js seed:run [--specific=file.js] //El archivo es opcional
```

Para crear nuevos archivos:

```
> node knex-cli.js seed:make seed_name
```

Dentro del sistema de seeds se ha creado un seed especial `default_data_load` encargado de cargar archivos JSON de la carpeta `seeds/data`.

Este sistema utiliza un sistema en el que:

-   Cada carpeta dentro de `data` indica la tabla
-   Cada archivo json ha de llamarse con el siguiente patrón:
    `document_type[.xxxx].json`

> Para mas información acceder al archivo `default_data_load` en el que se explica en profundidad.

### Compilación

Para la generación de los distribuibles, es necesario ejecutar

```shell
gulp compile
```

Esto creará una carpeta out/output en la raíz del proyecto incluyendo los distribuibles de la aplicación.

### Publishing

Se proporcionarán los siguientes entregables:

-   angie-vx.x.x.zip

## Configuración Keycloak

El sistema utiliza keycloak como servidor de autenticación y autorización. Esto implica que será necesario configurar ciertos aspectos dentro de keycloak para poder ejecutar la aplicación de forma correcta.

Configuraciones necesarias:

1. Crear realm **Angie**
2. Crear usuario para la aplicación
3. Crear cliente **angie-front**
4. En la configuración de **angie-front** establecer `Valid Redirect URIs: http://localhost:3000/*` y `Web Origins: http://localhost:3000`
5. Crear cliente **angie-back**
6. _Opcional:_ Establecer el tema **angie** en el realm

**Administrador**

7. Desde la pantalla Clients, en **angie-front** crear un rol 'admin'
8. Asignar al usuario creado ese rol
9. Crear un "Client Scope" llamado "client-roles-angie" (todo por defecto)
10. Crear un "Mapper" llamado **roles** asociado a **angie-front** con `Mapper Type: User Client Role`, con `Token Claim Name: roles` y `Claim JSON Type: String`
11. Ir al cliente **angie-front** y asociarle el Client Scope creado como Default (parte superior)

**Acceso REST**

12. Seleccionar el cliente **admin-cli**
13. Habilitar el switch "Service Account Enabled" (para ello previamente hay que poner el Access Type a 'confidential')
14. Guardar, aparecerá la pestaña Service Account Roles
15. En Client Roles seleccionar `realm_management`
16. Asociar el rol `view_users` mediante el botón **Add Selected**

**Roles**

17. Crear un Rol: 'admin' a nivel de Realm
18. Asignar el usuario de la aplicación a dicho rol

## Tests

La realización de tests se realiza utilizando la librería **mocha**, los ficheros se almacenan en la carpeta test

```shell
mocha test
```

## Api Reference

La api doc se genera automáticamente. Los datos de solicitudes y respuestas se rellenan de forma automática a medida que ocurren con lo que las pruebas que se vayan realizando irán enriqueciendo la documentación de la API.

Se puede consultar en: http://localhost:3105/api-docs

## Licensing

TODO

**TODO** Continuar mejorando esta documentación a medida que se implementan mas partes dentro del proyecto.

## Información Desarrollo

El proyecto ha sido desarrollado utilizando el [Framework Lisco](http://github.com/landra-sistemas/lisco).

En su repositorio se puede encontrar información al respecto.

# Conexión con JUM-Angie

El sistema se conecta a JUM-Angie mediante `socketio`. Para habilitar la conexión es necesario haber generado el secret en el primer punto.

Desde JUM-Angie es importante configurar en el parámetro `roche.angie.socketio.secret` el mismo valor.

Para mas información de la conexión ver el Readme del otro proyecto.
