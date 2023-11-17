const https = require('https');

const httpSend = (props) => {
    const {
        agent, endpoint, buff, headers 
    } = props;

    const requestOptions = {
        method: 'POST',
        agent,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
    };

    return new Promise((resolve, reject) => {
        const request = https.request(endpoint, requestOptions, (response) => {
            let responseData = '';

            response.on('data', (chunk) => {
                responseData += chunk;
            });

            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(responseData);
                } else {
                    console.error({
                        msg: "Failed to send txn",
                        response: responseData
                    });
                    reject(responseData);
                }
            });
        });

        request.on('error', (error) => {
            console.error({
                msg: "Getting error from https",
                err: error
            });
            reject(error);
        });

        request.write(buff);
        request.end();
    });
}

module.exports = {
    httpSend
}