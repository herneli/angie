require = require("esm")(module/*, options*/)

const { parentPort, workerData } = require("worker_threads");
const { KnexConnector } = require("lisco");
const { TaskFactory } = require("./TaskFactory");
const { Logger } = require("lisco");

const { type, code } = workerData;

(async () => {
    await Logger.configure();

    console.debug("Launching scheduled task. Type: " + type + " - Code: " + code);

    KnexConnector.init(require("../../../../../knexfile")[process.env.NODE_ENV]);

    await TaskFactory.getInstance(workerData).launch();

    // signal to parent that the job is done
    if (parentPort) parentPort.postMessage("done");
    else process.exit(0);
})();
