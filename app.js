const http = require('http');
const fs = require('fs');

const port = 2000;

const server = (req, res) => {
  fs.readFile('front/index.html', (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Salio mal');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    }
  });
};

http.createServer(server).listen(port);
