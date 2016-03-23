var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get("/",function(req,res){
client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
" (//name[@type='place'])[1] ",
function (error, result) {
  if(error){ console.error(error);}
  else {
    res.render('index', { title: 'ColensoProject', place: result.result });
  }
  }
  );
});

/* View all items in database. */
router.get("/fileList.jade",function(req,res){
client.execute("LIST Colenso",
function (error, result) {
  if(error){ console.error(error);}
  else {
    list = result.result;
    niceList = list.split("\r\n");
    res.render('fileList', { title: 'ColensoProject', list: niceList });
    }
  }
  );
});


module.exports = router;
