
//var app = require('connect')();
//var http = require('http');
'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var serverPort = process.env.NODE_PORT || 8080;
var routes = require('./routes/route')
var path = require('path');

var app = express({
    name:'Messages-App'
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', serverPort);
app.use('/', routes);

var createTable = function(){
    return new Promise(function (resolve, reject) {

    var AWS = require('aws-sdk');
    AWS.config.update({region: "us-west-2"});
    AWS.config.update({endpoint: "https://dynamodb.us-west-2.amazonaws.com"});

    var dynamoDB = new AWS.DynamoDB();

    var params = {
        TableName: 'Messages',
        KeySchema:[
            {AttributeName:"messageId", KeyType:"HASH"},
        ],
        AttributeDefinitions: [
            { AttributeName: "messageId", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    }

    dynamoDB.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            //reject(err);
            resolve(err);
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            resolve(data);
        }
    });
    });
}

Promise.all([createTable()]).then(values => {
    var server = app.listen(app.get('port'),'0.0.0.0', function () {
        console.log("Service up at " , serverPort);
    });
}).catch(function (reason) {
    console.log("failed to create server " , reason);
})
