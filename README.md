# ANGIE &middot; Angie's Next Generation Integration Engine

> middleware | integrations | hl7 | comunications | camel

Proyecto utilizado para el control de la mensajería entre diferentes sistemas. Este proyecto tiene como objetivo servir como configurador y backend para el proyecto 'JUM-Angie' (camel based).

## Pre-requisitos

NodeJS 12.XX o superior

```

$:> npm install
```

Generar las claves de privadas:

```
$:> node .\execute.js --generateKeys
```

Copiar el archivo `.env.sample` a `.env` y establecer las claves generadas anteriormente en `CRYPT_IV` y `CRYPT_SECRET`.

> **Es importante no perder estas claves ya que se utilizan para la encriptación de ciertas cadenas en la aplicación y sin ellas no podrán ser desencriptadas.**

Generar secret para JUM-Agents:

```
$:> node .\execute.js --jumSecret
```

Establecer la clave generada anteriormente en `JUM_AGENTS_SECRET` dentro del archivo `.env`.

## Docker Environment

Necesario disponer de docker instalado en el sistema el cual creará los contenedores: PostgreSQL, Keycloak, Prometheus y Grafana.

El arranque y creación de estos sistemas se realiza mediante:

```
$:angie-docker> docker-compose up
```

También se puede instalar la extensión docker y docker-compose en vscode para facilitar la monitorización.

Los puertos en los que se encuentra, por defecto, cada componente son:

-   PostgreSQL: 3132
-   Keycloak: 3114
-   Prometheus: 3190
-   Grafana: 3100

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
$:> npm run view
$:> node execute.js
```

Este comando cargará la base de datos y demás componentes necesarios para el funcionamiento de la aplicación. Iniciará la escucha en los puertos:

-   3105

### Desarrollo

En el archivo `knexfile.js` se establecen las propiedades de acceso a la base de datos. **Se recomienda mantener las configuraciones y utilizar los contenedores proporcionados para mantener un entorno uniforme.**

### Database Migration

Up:

```
$:> node knex-cli.js migrate:latest  --env development
```

Down:

```
$:> node knex-cli.js migrate:rollback  --env development
```

`knex-cli` es un acceso rápido a la librería knex para poderlo ejecutar aunque la dependencia no se encuentre instalada en el sistema. Se utiliza exactamente igual que Knex. Mas info: https://knexjs.org/#Migrations-CLI

Para crear nuevas migraciones:

```
$:> node knex-cli.js  migrate:make migration_name
```

#### Database Seeds

Los ficheros de seed para rellenar tablas de la base de datos se ejecutan mediante:

```
$:> node knex-cli.js seed:run [--specific=file.js] //El archivo es opcional
```

Para crear nuevos archivos:

```
$:> node knex-cli.js seed:make seed_name
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
$:> gulp compile
```

Esto creará una carpeta out/output en la raíz del proyecto incluyendo los distribuibles de la aplicación.

### Publishing

Se proporcionarán los siguientes entregables:

-   **ANGIE-x.x.xbyyy.install.zip** -> Instalador de la aplicacion
-   **ANGIE-x.x.xbyyy.baseconfig.zip** -> Configuración base docker containers
-   **angie-image-bxxx.tar** -> Contenedor docker para Angie
-   **jumangie-image-bxxx.tar** -> Contenedor docker par JUMAngie


### Docker image build

Para la generación de la imagen docker es necesario ejecutar el siguiente comando:
```
$:> docker build . -t landra/angie
```

> Es necesario haber compilado el proyecto previamente (ver [Compilación](#compilación))

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

**Autologin OAuth Grafana**

19. Crear cliente **grafana**
20. En la configuración del cliente **grafana** con :
   - Access Type: `public` 
   - Root URL: `http://localhost:3100/`
   - Valid Redirect URIs: `http://localhost:3100/*`
   - Admin URL: `http://localhost:3100/` 
   - Web Origins: `*`.


## Tests

La realización de tests se realiza utilizando la librería **mocha**, los ficheros se almacenan en la carpeta test

```shell
$:> mocha test
```

## Api Reference

La api doc se genera automáticamente. Los datos de solicitudes y respuestas se rellenan de forma automática a medida que ocurren con lo que las pruebas que se vayan realizando irán enriqueciendo la documentación de la API.

Se puede consultar en: http://localhost:3105/api-docs


## Información Desarrollo

El proyecto ha sido desarrollado utilizando el [Framework Lisco](http://github.com/landra-sistemas/lisco).

En su repositorio se puede encontrar información al respecto.

# Conexión con JUM-Angie

El sistema se conecta a JUM-Angie mediante `socketio`. Para habilitar la conexión es necesario haber generado el secret en el primer punto.

Desde JUM-Angie es importante configurar en el parámetro `roche.angie.socketio.secret` el mismo valor.

Para mas información de la conexión ver el Readme del otro proyecto.



# Docker Deployment

Cargar las imágenes en docker en base a los archivos .tar:

```
$:> docker load --input .\jumangie-image-bXXX.tar
$:> docker load --input .\angie-image-bXXX.tar
```


El despliegue mediante docker se puede hacer mediante la utilización del siguiente `docker-compose`:

``` yml
version: '3'
services:

    angie_postgre:
        image: postgres:13
        environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=root
        volumes:
            - ./postgres/data:/var/lib/postgresql/data
            - ./dbinit:/docker-entrypoint-initdb.d/
        ports:
            - 3132:5432/tcp
        healthcheck:
          test: ["CMD-SHELL", "pg_isready"]
          interval: 10s
          timeout: 5s
          retries: 5

    angie_keycloak:
        image: quay.io/keycloak/keycloak:15.0.2
        ports:
            - 3114:8080
        volumes:
            - ./keycloak/themes/angie:/opt/jboss/keycloak/themes/angie
        environment:
            DB_VENDOR: POSTGRES
            DB_ADDR: angie_postgre
            DB_DATABASE: keycloak
            DB_USER: postgres
            DB_SCHEMA: public
            DB_PASSWORD: root
            KEYCLOAK_USER: admin
            KEYCLOAK_PASSWORD: admin
            JAVA_OPTS_APPEND: "-Dkeycloak.profile.feature.upload_scripts=enabled"
        healthcheck:
          test: ["CMD", "curl", "-f", "http://localhost:8080/auth/"]
          interval: 5s
          timeout: 2s
          retries: 15
        depends_on:
            angie_postgre:
              condition: service_healthy
    
    angie_prometheus:
      image: prom/prometheus
      ports:
        - 3190:9090
      command:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--storage.tsdb.retention=30d'
        - '--web.console.libraries=/usr/share/prometheus/console_libraries'
        - '--web.console.templates=/usr/share/prometheus/consoles'
      volumes:
        - ./prometheus/:/etc/prometheus/
        - ./prometheus/prometheus_data:/prometheus
      
    angie_grafana:
      image: grafana/grafana
      ports:
        - 3100:3100
      volumes:
        - ./grafana/etc/grafana:/etc/grafana
        - ./grafana/var/lib/grafana:/var/lib/grafana
        - ./grafana/var/log/grafana:/var/log/grafana
      user: "1000"
      depends_on:
            angie_keycloak:
                condition: service_healthy
            angie_prometheus:
                condition: service_started
    
    angie:
      image: ghcr.io/landra-sistemas/angie:latest
      ports:
        - 3105:3105
        - 3106:3106
      environment:
          DATABASE_HOST: angie_postgre
          DATABASE_PORT: 5432
          DATABASE_USER: postgres
          DATABASE_PASSWORD: root
          DATABASE_NAME: angie
          KEYCLOAK_URL: http://angie_keycloak:8080/auth
          KEYCLOAK_REDIRECT_URL: http://localhost:3114/auth
          KEYCLOAK_REALM: Angie
          KEYCLOAK_BACK_CLI: angie-back
          KEYCLOAK_FRONT_CLI: angie-front
          KEYCLOAK_ADMIN_CLI: admin-cli
          KEYCLOAK_ADMIN_SECRET: 40976b00-7419-4257-9432-61efb079ea92
          CRYPT_IV: 0a5e07434deb42aff9611fb385715da8
          CRYPT_SECRET: 02a11de935a009e5eece55ae8ea63c39edbecb36cb939b79b549622a91722d38
          JUM_AGENTS_SECRET: 0f250d3e959eaea609043d25e2baccbe
          PACKAGE_REPOSITORY: https://github.com/landra-sistemas/angie-package-repo.git
      volumes:
            - ./angie/logs:/home/node/angie/logs
      depends_on:
            angie_postgre:
                condition: service_healthy
            angie_keycloak:
                condition: service_healthy


    jumangie1:
      container_name: jumangie1
      image: ghcr.io/landra-sistemas/jum-angie:latest

      environment:
          SPRING_DATASOURCE_URL: jdbc:postgresql://angie_postgre:5432/angie
          SOCKETIO_ID: e9cbba1d-88b1-461f-94a9-7f4e426ead3d
          SOCKETIO_NAME: JUM1
          SOCKETIO_SECRET: 0f250d3e959eaea609043d25e2baccbe
      depends_on:
            angie_postgre:
                condition: service_healthy
            angie:
                condition: service_started

    jumangie2:
      container_name: jumangie2
      image: ghcr.io/landra-sistemas/jum-angie:latest

      environment:
          SPRING_DATASOURCE_URL: jdbc:postgresql://angie_postgre:5432/angie
          SOCKETIO_ID: af394919-ee72-4516-822b-316e035b18ef
          SOCKETIO_NAME: JUM_EXTRA
          SOCKETIO_SECRET: 0f250d3e959eaea609043d25e2baccbe
      depends_on:
            angie_postgre:
                condition: service_healthy
            angie:
                condition: service_started
```
