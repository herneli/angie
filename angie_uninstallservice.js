

var moduleAlias = require('module-alias');
require('module-alias/register');

var isWin = process.platform === "win32";
if (isWin) {
    moduleAlias.addAlias('node-windows', process.cwd() + '/lib/win32/node-windows');
}
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name: 'angie',
    description: 'Angie´s Next Generation Integration Engine',
    script: __dirname + '/execute.js',
    nodeOptions: [
        '--max_old_space_size=1024'
    ],
    workingDirectory: __dirname
});


svc.uninstall();