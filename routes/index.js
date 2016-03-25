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
router.get("/fileList",function(req,res){
client.execute("XQUERY db:list('Colenso')",
function (error, result) {
  if(error){ console.error(error);}
  else {
    list = result.result;
    niceList = list.split("\r\n");
    //console.log(niceList);
    res.render('fileList', { title: 'ColensoProject', list: niceList });
    }
  }
  );
});

router.get("/viewFile",function(req,res){
client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
  	"(doc('Colenso/"+req.query.file+"'))[1]",
function (error, result) {
  if(error){
	   console.error(error);
	  }
	else {
    //console.log(result.result);
		res.render('viewFile', { title: 'Colenso Project', file: result.result });
	 }
	});
});

router.get("/searchResult",function(req,res){
client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
req.query.searchString,
function(error,result){
    if(error){
      console.error(error);
      }
    else{
      console.log(req.query.searchString);
      //console.log(result.result);
      res.render('searchResult',{title: 'Colenso Project', searchItem: result.result});
    }
  });
});

module.exports = router;
