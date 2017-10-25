var express        = require('express');
var MongoClient    = require('mongodb').MongoClient;
var bodyParser     = require('body-parser');
var config         = require('./config');
var app            = express();

app.use(bodyParser.json());

MongoClient.connect(config.url, (err, database) => {
    if (err) return console.log(err)
  
    require('./app/routes')(app, database);
    
    app.listen(config.port, () => {
        console.log('We are live on ' + config.port);
    });               
})