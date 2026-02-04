const http = require('http');

const options = {
    hostname: 'localhost',
    port: parseInt(process.env.PORT) || 3001,
    path: '/api', // Check root API endpoint
    method: 'GET',
    timeout: 2000,
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200 || res.statusCode === 404) {
        // 404 on /api might be fine if it just means "Hello World" is elsewhere, 
        // but 200 is ideal. 500 is bad.
        console.log('Health check passed: Server is reachable.');
        process.exit(0);
    } else {
        console.log(`Health check failed: Unexpected status code ${res.statusCode}`);
        process.exit(1);
    }
});

req.on('error', (e) => {
    console.error(`Health check failed: ${e.message}`);
    process.exit(1);
});

req.end();
