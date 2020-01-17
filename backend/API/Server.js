const http = require('http');
const app  = require('./app.js');

const port = process.env.PORT || 3100;
const server = http.createServer(app);

server.listen(port, () => {
    // print a message when the server run successfully
    console.log("Server started successfully")
});
