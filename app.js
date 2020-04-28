console.log("");
console.log("#");
console.log("#");
console.log("# tss-portal2");
console.log("#");
console.log("#");
console.log("#");

/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

//
// ↓ ↓ ↓ ↓ ↓
//
// Additional
//
console.log("[app.js] isLocal:",appEnv.isLocal); // true = local / false = server
if (appEnv.isLocal == true) {
	var env = "local";
} else {
	var env = "server";
}

var path = require('path');

//var index = require("./routes/index");
//var comprehensive_contract_index = require("./routes/comprehensive_contract/index");
var comprehensive_contract_search = require("./routes/comprehensive_contract/search");
var tss_portal_search = require("./routes/tss_portal/search");
var tss_portal_update = require("./routes/tss_portal/update");
var chis_contract = require("./routes/chis_contract/index");
var open_call_list = require("./routes/open_call_list/index");

//Set session expire time
app.use(require('express-session')({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 4320 * 60 * 1000  //4320 min(3days)
	}
}));
var cookieParser = require('cookie-parser');


//Get POST parameter.Set body-parser(Required from express4)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// set ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


//Redirect from http to https
function requireHTTPS(req, res, next) {
	if (req.headers && req.headers.$wssp === "80") {
		return res.redirect('https://' + req.get('host') + req.url);
	};
	next();
};
app.use(requireHTTPS);


var helmet = require('helmet');

//app.use("/", index);
//app.use("./comprehensive_contract", comprehensive_contract_index);
app.use("/comprehensive_contract/search", comprehensive_contract_search);
app.use("/tss_portal/search", tss_portal_search);
app.use("/tss_portal/update", tss_portal_update);
app.use("/chis_contract", chis_contract);
app.use("/open_call_list", open_call_list);

//
// ↑ ↑ ↑ ↑ ↑
//


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
