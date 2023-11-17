const https = require("https");
const {parentPort, workerData} = require("worker_threads");
const {template} = require('./template');
const {httpSend} = require("./httpSender");

const {endpoint, jwt} = workerData || {};

if(!endpoint || !jwt) {
    console.error("Missing endpoint or jwt");
    parentPort.postMessage({
        status: "FAILED",
        reason: "Missing endpoint or jwt"
    });
    return;
}

let running = false;
const agent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
});

parentPort.on("message", async (msg) => {
    
    if(msg == "stop") {
        running = false;
        return;
    }
    if(msg == "start") {
        runLoop();
        return;
    }
})

const runLoop = async () => {
    if(running) {
        return;
    }
    running = true;
    const txn = template;
    buff = Buffer.from(JSON.stringify(txn));
    running = true;

    let sendCount = 0;
    let failCount = 0;
    let lastSendUp = Date.now();
    while(running) {
        let res = await httpSend({
            agent, 
            endpoint: `${endpoint}/api/txn/send`, 
            buff,
            headers: {
                'x-fh-auth': jwt
            }
        })
        if(typeof res == 'string') res = JSON.parse(res);

        if(!res.id) {
            ++failCount;
        } else {
            ++sendCount;
        }
        if(Date.now() - lastSendUp > 1000) {
            parentPort.postMessage({
                metrics: {
                    sendCount,
                    failCount,
                }
            });
            sendCount = 0;
            failCount = 0;
            lastSendUp = Date.now();
        }
    }
    parentPort.postMessage({
        final: true,
        metrics: {
            sendCount,
            failCount,
        }
    });
}

