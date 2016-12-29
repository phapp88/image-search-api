var express = require('express');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./routes/index'));

app.listen(process.env.PORT || 8080);