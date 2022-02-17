var gulp = require('gulp');
var del = require('del');
var zip = require('gulp-zip');
var fs = require('fs');
var exec = require('child_process').exec;

var versions = require('./version.json');
//Si hay archivo compilation se agrega el numero de compilacion de la version actual.
var comp = { number: "" };
try {
    comp = require('./compilation.json');
} catch (ex) {
    console.log("Compilation number not found");
}
var appVersion = versions && versions[0] ? versions[0].title.replace(/Versi[oó]n /, '') : '1.0.0';

var viewpath = './frontend';
var outputdir = './out/output/';
var angieout = outputdir + '/angie';
var installpkg = 'ANGIE-' + appVersion + "b" + comp.number + '.install.zip';

/**
 * Elimina completamente
 */
function fullclean() {
    return del([
        outputdir + '/**/**'
    ]);
}


/**
 * Compila la vista
 */
function buildView(done) {
    return exec('npm run-script build', { cwd: viewpath }, function (err, stdout, stderr) {
        console.log(stderr);
        done();
    });
}

/**
 * 
 * @param {*} done
 */
function copyServer(done) {
    return gulp.src([
        'app/**',
        'config/**',
        'i18n/**',
        'seeds/**',
        'config/**',
        'migrations/**',
        'lib/**',
        '.env.sample',
        'package.json',
        'log4js.json',
        'version.json',
        'compilation.json',
        'package-lock.json',
        'knex-cli.js',
        'knexfile.js',
        'execute.js',
        'baseconfig.json',
        'angie_installservice.bat',
        'angie_installservice.js',
        'angie_uninstallservice.bat',
        'angie_uninstallservice.js',
        'hash.js',
        'index.js'
    ], { base: '.', dot: true, allowEmpty: true })
        .pipe(gulp.dest(angieout))
        .on('end', done);
}

/**
 * 
 */
function installServerDeps(done) {
    return exec('npm install --production', { cwd: angieout }, function (err, stdout, stderr) {
        console.log(stderr);
        done();
    });

}
/**
 * Eliminar duplicados en el node modules
 */
function dedupe(cb) {
    exec('npm dedupe', { cwd: angieout }, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        cb(err);
    });
}
/**
 * Eliminar duplicados en el node modules
 */
function cleanNode(cb) {
    var command = __dirname + '/compile/node-prune.linux';
    if (process.platform === "win32") {
        command = __dirname + '/compile/node-prune.win.exe';
    }
    exec(command, { cwd: angieout }, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        cb(err);
    });
}

/**
 * 
 */
function copyView() {
    return gulp.src([
        viewpath + '/build/**'
    ], {})
        .pipe(gulp.dest(angieout + '/app/statics'));
}

/**
 * 
 * @param {*} done 
 */
function hashVersion(done) {
    var hashElement = require('folder-hash').hashElement;

    // pass options (example: exclude dotFolders)
    var options = { folders: { exclude: ['node_modules', 'bin', 'logs'] } };
    hashElement(angieout + "/app", options)
        .then(function (hash) {
            fs.writeFileSync(angieout + '/hash.txt', hash.hash);
            done(null);
        })
        .catch(function (error) {
            return done(error);
        });
}




/**
 * Empaqueta la version de actualizacion
 */
function createInstaller(done) {
    return gulp.src([
        // outputdir + '/NOTES.txt',
        angieout + '/**/**'
    ], { base: outputdir, dot: true })
        .pipe(zip(installpkg))
        .pipe(gulp.dest(outputdir))
        .on('end', done);
}


/**
 * Realiza el proceso de build completo 
 */
module.exports.compile = gulp.series(fullclean, buildView, copyServer, installServerDeps, dedupe, cleanNode, copyView, hashVersion, createInstaller);



