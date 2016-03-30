var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");
var express = require('express');
var cheerio = require('cheerio');
var url = require('url');
var router = express.Router();
var fileName = "";
var multer = require('multer');
var multerStorage = multer.memoryStorage();
var multerUpload = multer({
  multerStorage: multerStorage,
  dest: "./uploads"
});
router.use(multerUpload.single('file'));

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

/* View an individual file from fileList or searchResults*/
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
    fileName = req.query.file;
    res.render('viewFile', { title: 'Colenso Project', file: result.result });
	 }
	});
});

/*View raw TEI of a file*/
router.get("/viewRaw",function(req,res){
client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
  	"(doc('Colenso/"+fileName+"'))[1]",
function (error, result) {
  if(error){
	   console.error(error);
	  }
	else {
    //console.log(result.result);
    //console.log(req.query.file);
    res.render('viewRaw', { title: 'Colenso Project', file: result.result });
	 }
	});
});


router.get("/searchByString",function(req,res){
  res.render('searchByString',{title: 'Colenso Project'});
});

router.get("/searchByXQuery",function(req,res){
  res.render('searchByXQuery',{title: 'Colenso Project'});
});

/*Search database using strings, logical operators and wildcards*/
router.get("/searchStringResult",function(req,res){
  var query = req.query.query;
  var isRaw = req.query.raw;
  console.log("Query is: " + query);
  //var searchQuery = ("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1,0';" +
      //"for $v in .//TEI[. contains text"+query+"]return db:path($v)");
  //var searchQuery = ("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
    //"for $n in (collection('Colenso'))");
  var searchQuery = ("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" + "for $v in .//TEI[. contains text "+query+"] return db:path($v)");
  console.log("Search Query is: " + searchQuery);
  client.execute((searchQuery),
  function (error, result) {
    if(error){
	     console.error(error);
	  }
	  else {
      var fileList = result.result.split('\n');
      var length = fileList.length;
      console.log(fileList);
      console.log(length);
      res.render('searchStringResult', { title: 'Colenso Project', files: fileList, searchString: query, numResults: length, raw: isRaw  });
	 }
	});
});

router.get("/searchXQueryResult", function(req,res){
  var query = req.query.query;
  var isRaw = req.query.raw;
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
      res.render('searchXQueryResult',{title: 'Colenso Project', files: fileList, searchString: query, numResults: length, raw: isRaw});
    }
  });
});

router.get("/uploadFile",function(req,res){
    res.render('uploadFile',{title: 'ColensoProject'});
});

router.post("/upload",function(req,res){
  var upFile = req.file;
  console.log(upFile);
  if(upFile){
    var path = upFile.originalname;
    console.log("Path is: " + path);
    var xml = upFile.buffer.toString();
    client.execute('ADD to Colenso/uploads/'+path+' ""' + xml +'""',
    function(error,result){
      if(error){
        console.error(error);
      }
      else{
        console.log("Upload Successful");
      }
    });
  }
  else{
    console.log("No file chosen");
  }
  res.redirect("/fileList");
});

module.exports = router;
