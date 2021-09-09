

# ANGIE &middot; Angie's Next Generation Integration Engine
> middleware | integrations | hl7 | comunications | camel

Proyecto utilizado para el control de la mensajería entre diferentes sistemas. Este proyecto tiene como objetivo servir como configurador y backend para el proyecto 'Old Joe' (camel based).


## Prerequisites

NodeJS 12.XX o superior

```
> npm install
```

Generar las claves para JWT:

```
> node .\execute.js --generateKeys
```

Copiar el archivo `.env.sample` a `.env` y establecer las claves generadas anteriormente en `CRYPT_IV` y `CRYPT_SECRET`.




## Installing / Getting started

Ejecutar el servidor

```shell
node execute.js
```
> Será necesario que la vista haya sido iniciada desde su proyecto.

Este comando cargará la base de datos y demas componentes necesarios para el funcionamiento de la aplicación. Iniciará la escucha en los puertos:
- 3105

Es necesario disponer de PostgreSQL, RabbitMQ y ElasticSearch funcionando en el sistema (contenedores incluidos en `angie-docker`).

## Developing



### Setting up Dev


En el archivo `knexfile.js` se establecen las propiedades de acceso a la base de datos. __Se recomienda mantener las configuraciones y utilizar los contenedores proporcionados para mantener un entorno uniforme.__

### Building

Para la generación de los distribuibles, es necesario ejecutar

```shell
gulp compile
```

Esto creará una carpeta out/output en la raíz del proyecto incluyendo los distribuibles de la aplicación.

### Deploying / Publishing
El proyecto será publicado en google Drive, accesible para los diferentes miembros de Roche

Solo se proporcionarán los archivos
- angie-vx.x.x.zip



## Tests

La realización de tests se realiza utilizando la librería __mocha__, los ficheros se almacenan en la carpeta test

```shell
mocha test
```


## Api Reference

Se incluye la API reference en la carpeta __apidoc__ del proyecto


## Licensing

TODO




### VARIOS



- Generar documentación para la api

npm install apidoc -g

http://apidocjs.com/

apidoc -i ./ -o apidoc/ -e node_modules/ -e bin/ -e out/ -e temp/


## Database Migration

Up:

```
> node knex-cli.js migrate:latest
```

Down:

```
> node knex-cli.js migrate:rollback
```

`knex-cli` es un acceso rápido a la librería knex para poderlo ejecutar aunque la dependencia no se encuentre instalada en el sistema. Se utiliza exactamente igual que Knex. Mas info: https://knexjs.org/#Migrations-CLI




### Elastic

Optimizando gestión de la memoria:

- Asignar a ES en el xms y xms un 40% de la memoria del sistema.
- En el archivo conf/elasticsearch.yml al final de todo poner:

{code:java}

bootstrap.memory_lock: true
{code}