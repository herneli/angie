var hashElement = require('folder-hash').hashElement;

// pass options (example: exclude dotFolders)
var options = { folders: { exclude: ['node_modules', 'bin', 'logs'] } };
hashElement(__dirname + "/app", options)
    .then(function (hash) {
        console.log('Result for folder "' + __dirname + '/app" (with options):');
        console.log(hash.hash, '\n');
    })
    .catch(function (error) {
        return console.error('hashing failed:', error);
    });