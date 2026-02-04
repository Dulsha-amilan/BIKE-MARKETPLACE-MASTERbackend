const http = require('http');

const data = JSON.stringify({
    title: 'Test Vehicle',
    make: 'TestMake',
    model: 'TestModel',
    type: 'TestType',
    condition: 'Used',
    price: 1000,
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/vehicles/upload',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
    },
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        if (res.statusCode === 201) {
            console.log('SUCCESS: Vehicle created.');
            process.exit(0);
        } else {
            console.log('FAILURE: Unexpected status code.');
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.write(data);
req.end();
