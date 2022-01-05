const { io } = require("socket.io-client");

const PORT = 3105;
const secret = "0f250d3e959eaea609043d25e2baccbe";

const client = ((overrideToken) => {
    //Conectar cliente al servidor
    return io(`http://localhost:${PORT}`, {
        auth: {
            token: overrideToken || secret,
        },
        query: {
            id: "e4e497c2-a338-4e8c-a07f-c31a2777d677",
            name: "JUM1",
            platform: process.platform,
        },
    });
})();
setTimeout(() => {
    client.on("connection", () => {
        console.log("Wiii");
    });
}, 1000);
