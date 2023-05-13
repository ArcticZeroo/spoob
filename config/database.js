const fs = require('fs');
const path = require('path');

module.exports = {
    mongo: {
        username: '',
        password: '',
        ip      : 'localhost',
        port    : 0,
        database: 'spoob'
    },
    ssh: {
        host: '',
        port: 0,
        user: '',
        privateKey: fs.readFileSync(path.join(process.cwd(), '/key/mineplex.ppk')),
        keepaliveInterval: 20*1000,
        keepaliveCountMax: 5,
        forwardOutPort: 12345
        //debug: s => console.log(s)
    },
    mysql: {
        host: '',
        port: 0,
        user: '',
        password: '',
        database: ''
    }
};