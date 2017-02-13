var express = require("express")
var config = require('./config.js')
var path = require("path")
var app = express();
var http = require('http');

// routes
var routes = require('./routes/index');

server = http.createServer(app).listen(config.portnumber, function() {
    var addr = server.address();
    console.log('Express server listening on http://' + addr.address + ':' + addr.port);
});

var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
// parse application/json
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static('public'));

app.use('/', routes);
