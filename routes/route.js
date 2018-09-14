
var express = require('express');
var router = express.Router();

var uuidv4 = require('uuid/v4');
var AWS = require("aws-sdk");

AWS.config.update({region: "us-west-2"});
AWS.config.update({endpoint: "https://dynamodb.us-west-2.amazonaws.com"});
var params;

router.get('/', function (req, res) {
    res.render('index.html');
});

router.get('/messages/:id?', function (req, res) {
    const docClient = new AWS.DynamoDB.DocumentClient();
    if(req.query.id){
        const messageId = req.query.id;

        params = {
            TableName:"Messages",
            Key:{
                "messageId":messageId
            }
        };

        docClient.get(params, function (err, data) {
            if(err){
                console.log(err);
                res.send({
                    status:500,
                    message:'Please try again later..!!'
                })
            }else{
                console.log("message retrieved ", data);
                var Items = [];
                Items.push(data.Item);
                //Check for Title palindrome
                var str = data.Item.title;
                var re = /[\W_]/g;
                var lowRegStr = str.toLowerCase().replace(re, '');
                var reverseStr = lowRegStr.split('').reverse().join('');
                if(reverseStr === lowRegStr){
                    data.Item.palindrome = true;
                }else{
                    data.Item.palindrome = false;
                }
                res.status(200).send(Items);
            }
        })
    }else{
        params = {
            TableName: "Messages",
        }
        docClient.scan(params, function (err, data) {
            if(err){
                console.log(err);
                res.send({
                    status:500,
                    message:'Please try again later..!!'
                })
            }else{
                console.log("data for messafes" , data);
                res.status(200).send(data.Items);
            }
        })
    }
});

router.post('/messages', function (req, res) {

    var docClient = new AWS.DynamoDB.DocumentClient();

    var createdOn = Date.now();
    var title = req.body.title;
    var content = req.body.content;
        var params = {
            TableName: "Messages",
            Item: {
                "messageId":  uuidv4(),
                "createdOn":Date.now(),
                "title": title,
                "content": content
            }
        };

        docClient.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add message", title, ". Error JSON:", JSON.stringify(err, null, 2));
                res.send({
                    status:500,
                    message:'Please try again later..!!'
                })
            } else {
                console.log("PutItem succeeded:", params.Item.id);
                res.send({
                    status:200,
                    message:'Successfully Added'
                })
            }
        });
});

router.delete('/messages', function (req, res){
    const docClient = new AWS.DynamoDB.DocumentClient();

    var itemsArray = [];

    for(var i =0;i<req.body.checkedIds.length;i++){
        var item = {
            DeleteRequest : {
                Key : {
                    'messageId' : req.body.checkedIds[i]
                }
            }
        };
        itemsArray.push(item);
    }

    var params = {
        RequestItems : {
            'Messages' : itemsArray
        }
    };
    docClient.batchWrite(params, function(err, data) {
        if (err) {
            console.log('Batch delete unsuccessful ...');
            console.log(err, err.stack); // an error occurred
            res.send({
                status:500,
                message:'Please try again later..!!'
            })
        } else {
            console.log('Batch delete successful ...');
            console.log(data); // successful response
            res.send({
                status:200,
                message:'Successfully Deleted'
            })
        }

    });
});

module.exports = router;