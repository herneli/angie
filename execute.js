require = require("esm")(module/*, options*/)


require('dotenv').config();
//module dependencies.
require('./index.js')().then(() => {
    //Nada que hacer aqui
}).catch((ex) => {
    console.error(ex)
});

//Capturar errores perdidos
process.on('uncaughtException', (err) => {
    // handle the error safely
    console.error(`Error: ${err || err.stack || err.message}`);
});
//Capturar promises perdidos
process.on('unhandledPromiseException', (err) => {
    // handle the error safely
    console.error(`Error: ${err || err.stack || err.message}`);
});


