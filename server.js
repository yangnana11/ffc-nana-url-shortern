'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

const urlSchema = new mongoose.Schema({
  orginal: {
    type: String,
    required: true
  },
  short: {
    type: Number,
    required: true
  }
});

var URL = mongoose.model('URL', urlSchema);


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new",function(req,res){  
  let path = req.body.url.split("://");
  let url = path.length>1 ? path[1] : path[0];
  URL.find().count(function(err, count) {
    if (err) {
      res.json({error: err});
    } else {
      let short = count + 1;
      dns.lookup(url, (err, address) => {    
        if (err) {
          res.json({"error":"invalid URL"});
        } else {
          let url = new URL({
            orginal: req.body.url,
            short: short
          });
          url.save((err, result) => {
            if (err) {
              res.json({error: err});
            } else {
              res.json({original_url: req.body.url,short_url: short});
            }
          });
        }
      });      
    }
  });  
});

app.get("/api/shorturl/:id", function (req, res) {
  URL.findOne({short: req.params.id}, (err, url)=> {
    if (err) {
      res.json({error: err});
    } else {
      res.statusCode = 302;
      res.setHeader("Location", url.orginal);
      res.end();
    }    
  });  
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});