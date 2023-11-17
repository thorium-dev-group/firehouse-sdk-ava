const {template} = require('./template');
const https = require('https');
const { Worker } = require("worker_threads");
require("dotenv").config();
const {httpSend} = require("./httpSender");

let jwt;
let running = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
    const API_KEY = process.env.API_KEY;
    const API_ENDPOINT = process.env.API_ENDPOINT;
    const API_SECRET = process.env.API_SECRET;
    const WORKER_THREADS = process.env.WORKER_THREADS || 1;

    if(!API_KEY || !API_ENDPOINT || !API_SECRET) {
        console.error("Missing API_KEY, API_ENDPOINT, or API_SECRET in .env file");
        return;
    }

    const agent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000,
    });

    /**
     * First have to login to get JWT
     */
    const data = {
        apiKey:  API_KEY,
        apiSecret:   API_SECRET
    }
    let buff = Buffer.from(JSON.stringify(data));

    const res = await httpSend({
        agent,
        endpoint: `${API_ENDPOINT}/api/login`,
        buff
    });

    const r = typeof res == 'string' ? JSON.parse(res) : res;
    if(!r.jwt) {
        console.error("No JWT returned from API");
        return;
    }
    jwt = r.jwt;

    const workers = [];
    let start = Date.now();
    let sendCount = 0;
    let failCount = 0;
    let lastPrint = Date.now();
    let workersDone = 0;

    for(let i = 0; i < WORKER_THREADS; ++i) {
        const worker = new Worker("./src/worker.js", {
            workerData: {
                endpoint: API_ENDPOINT,
                jwt
            }
        });
        workers.push(worker);
        worker.on("message", (msg) => {
            if(msg.status && msg.status === "FAILED") {
                throw new Error("Worker failed to start: " + msg.reason);
            }
            if(msg.metrics){
                sendCount += msg.metrics.sendCount;
                failCount += msg.metrics.failCount;
                if(msg.final) {
                    ++workersDone;
                }
                if(Date.now() - lastPrint > 1000) {
                    console.log({
                        msg: "Results so far...",
                        sendCount,
                        failCount,
                        postPerSec: sendCount / (Date.now() - start) * 1000
                    });
                    lastPrint = Date.now();
                }
            }
        });
        worker.on("error", (err) => {
            console.error({
                msg: "Worker error",
                err
            });
        });
        worker.on("exit", (code) => {
            if(code != 0) {
                console.error({
                    msg: "Worker exited with non-zero code",
                    code
                });
            }
        });
        worker.postMessage("start");
    }
    
    while(running) {
        await sleep(1000);
    }
    for(let i = 0; i < workers.length; ++i) {
        workers[i].postMessage("stop");
    }
    while(workersDone < workers.length) {
        await sleep(3000);
    }
    console.log({
        msg: "Final Results",
        sendCount,
        failCount,
        postPerSec: sendCount / (Date.now() - start) * 1000
    });
    console.log("Shutdown complete");

}


main();

process.on('SIGINT', () => {
    running = false;
});