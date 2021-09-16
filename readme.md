

# ANGIE &middot; Angie's Next Generation Integration Engine
> middleware | integrations | hl7 | comunications | camel

Proyecto utilizado para el control de la mensajería entre diferentes sistemas. Este proyecto tiene como objetivo servir como configurador y backend para el proyecto 'Old Joe' (camel based).


## Pre-requisitos

NodeJS 12.XX o superior

``` javascript
//Es necesario tener un usuario en el registro de landra
> npm login


> npm install
```

Generar las claves para JWT:

```
> node .\execute.js --generateKeys
```

Copiar el archivo `.env.sample` a `.env` y establecer las claves generadas anteriormente en `CRYPT_IV` y `CRYPT_SECRET`.


## Docker Environment

Necesario disponer de docker instalado en el sistema el cual creará los contenedores: PostgreSQL, RabbitMQ, Kibana y ElasticSearch.

El arranque y creación de estos sistemas se realiza mediante:

```
$:angie-docker> docker-compose up
```

También se puede instalar la extensión docker y docker-compose en vscode para facilitar la monitorización.

Los puertos en los que se encuentra, por defecto, cada componente son:

- PostgreSQL: 3132
- RabbitMQ: 3111 y 3112(management)
- ElasticSearch: 3103
- Kibana: 3108

## Ejecutando la aplicación

Ejecutar el servidor

```shell
> npm run view
> node execute.js
```

Este comando cargará la base de datos y demás componentes necesarios para el funcionamiento de la aplicación. Iniciará la escucha en los puertos:
- 3105



### Desarrollo


En el archivo `knexfile.js` se establecen las propiedades de acceso a la base de datos. __Se recomienda mantener las configuraciones y utilizar los contenedores proporcionados para mantener un entorno uniforme.__

### Database Migration

Up:

```
> node knex-cli.js migrate:latest
```

Down:

```
> node knex-cli.js migrate:rollback
```

`knex-cli` es un acceso rápido a la librería knex para poderlo ejecutar aunque la dependencia no se encuentre instalada en el sistema. Se utiliza exactamente igual que Knex. Mas info: https://knexjs.org/#Migrations-CLI

### Compilación

Para la generación de los distribuibles, es necesario ejecutar

```shell
gulp compile
```

Esto creará una carpeta out/output en la raíz del proyecto incluyendo los distribuibles de la aplicación.

### Publishing

Se proporcionarán los siguientes entregables:
- angie-vx.x.x.zip



## Tests

La realización de tests se realiza utilizando la librería __mocha__, los ficheros se almacenan en la carpeta test

```shell
mocha test
```


## Api Reference

**TODO** Crear OpenAPI


## Licensing

TODO


