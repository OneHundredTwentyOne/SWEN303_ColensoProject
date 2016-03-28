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
    //console.log(req.query.file);
    res.render('viewFile', { title: 'Colenso Project', file: result.result });
	 }
	});
});

router.get("/searchByString",function(req,res){
  res.render('searchByString',{title: 'Colenso Project'});
});

router.get("/searchByXQuery",function(req,res){
  res.render('searchByXQuery',{title: 'Colenso Project'});
});

router.get("/searchStringResult",function(req,res){
  var query = req.query.query;
  console.log(query);
  var searchQuery = ("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
    "for $t in //text where matches($t, '" + query + "', 'i') = true() return db:path($t)");
  console.log(searchQuery);
  client.execute((searchQuery),
  function (error, result) {
    if(error){
	     console.error(error);
	  }
	  else {
      var fileList = result.result.split('\n');
      var length = fileList.length;
      res.render('searchStringResult', { title: 'Colenso Project', files: fileList, searchString: query, numResults: length  });
	 }
	});
});

router.get("/searchXQueryResult", function(req,res){
  var query = req.query.query;
  console.log("XQUERY IS: " + query);
  client.execute(("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" + "for $n in (collection('Colenso/')"+ query +")" + "return db:path($n)"),
  function(error,result){
    if(error){
      console.error(error);
    }
    else{
      var fileList = result.result.split('\n');
      console.log(fileList);
      var length = fileList.length;
      res.render('searchXQueryResult',{title: 'Colenso Project', files: fileList, searchString: query, numResults: length});
    }
  });
});
module.exports = router;
