const http = require('http');

const options = {
    hostname: 'localhost',
    port: parseInt(process.env.PORT) || 3001,
    path: '/api',
    method: 'GET',
    timeout: 2000,
};

function checkHealth() {
    return new Promise((resolve, reject) => {
        console.log('1. Checking Server Health...');
        const req = http.request(options, (res) => {
            if (res.statusCode === 200 || res.statusCode === 404) {
                console.log('   [PASS] Server is reachable (Status: ' + res.statusCode + ')');
                resolve();
            } else {
                reject('   [FAIL] Unexpected status code: ' + res.statusCode);
            }
        });
        req.on('error', (e) => reject('   [FAIL] Connection error: ' + e.message));
        req.end();
    });
}

function checkUpload() {
    return new Promise((resolve, reject) => {
        console.log('2. Testing Upload Capability...');

        const data = JSON.stringify({
            title: 'Verify Deployment Vehicle',
            make: 'VerifyMake',
            model: 'VerifyModel',
            type: 'Test',
            condition: 'New',
            price: 500
        });

        const uploadOptions = {
            ...options,
            path: '/api/vehicles/upload',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };

        const req = http.request(uploadOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    console.log('   [PASS] Vehicle created successfully.');
                    resolve();
                } else {
                    console.log('Body:', body);
                    reject('   [FAIL] Upload failed with status: ' + res.statusCode);
                }
            });
        });
        req.on('error', (e) => reject('   [FAIL] Upload connection error: ' + e.message));
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        await checkHealth();
        await checkUpload();
        console.log('\n[SUCCESS] Deployment Verification Passed!');
        process.exit(0);
    } catch (e) {
        console.error('\n' + e);
        console.error('[FAILURE] Verification Failed.');
        process.exit(1);
    }
}

run();
