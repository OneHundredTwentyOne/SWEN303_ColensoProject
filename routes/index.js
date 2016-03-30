var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");
var express = require('express');
var cheerio = require('cheerio');
var url = require('url');
var router = express.Router();
var fileName = "";
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
	storage: storage,
	dest: './uploads'
});
router.use(upload.single('file'));

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
    res.render('viewFile', { title: 'Colenso Project', file: result.result, fileName: fileName });
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

/*Access the searchByString page*/
router.get("/searchByString",function(req,res){
  res.render('searchByString',{title: 'Colenso Project'});
});

/*Access the searchByXQuery page*/
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

/*Search database using XQuery*/
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

/*Access file upload page*/
router.get("/uploadFile",function(req,res){
    res.render('uploadFile',{title: 'ColensoProject'});
});

/*Performs the actual file upload*/
router.post("/upload",function(req,res){
	var file = req.file;
	if(file){
		var ownFilePath = file.originalname;
		var ownXmlFile = file.buffer.toString();
		client.execute('ADD TO Colenso/uploads/'+ownFilePath+' "'+ownXmlFile+'"', function(error, result){
			if(error){
				console.error(error);
			}
			else{
				console.log("File successfully uploaded");
			}
		});
	}
	else{
		console.log("No file selected");
	}
	res.redirect("/fileList");
});

/*Performs the file download*/
router.get("/downloadFile", function(req,res){
  var filePath = req.query.file;
  console.log("Path is: " + filePath);
  client.execute("XQUERY doc ('Colenso/"+filePath+"')",function(error,result){
    if(error){
      console.error(error);
    }
    else{
      var doc = result.result;
      var fileName = "saveFile";
      res.writeHead(200,{'Content-Disposition': 'attachment; filename=' + fileName});
      res.write(doc);
      res.end();
    }
  });
});

/*Saves changes when editing complete*/
router.post("/editComplete",function(req,res){
	var filePath = req.query.file;
	var xmlFile = req.body.editedFile;

	var cheerioXml = cheerio.load(xmlFile, {xmlMode: true});
	var query = "REPLACE "+filePath+" "+xmlFile;

	client.execute(query, function(error, result){
		if(error){
			console.error(error);
		}
		else{
			res.redirect("view?file="+filePath);
		}
	});
});

module.exports = router;
