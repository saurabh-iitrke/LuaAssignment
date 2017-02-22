var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  if (req.method === 'GET'){
        res.end(JSON.stringify({'RouteHeader':'123.321.213'}));
  }
  else{
        res.end(JSON.stringify({'Error' : 'Not Supported'}));
  }
}).listen(3001);
console.log('Server running at http://localhost:3001/');
