//
// Mood marble top page (index)
//
console.log("[comprehensive_contract/search.js] Comprehensive Contract Search")

var express = require('express');
var router = express.Router();

//
// Get data from Cloudant NoSQL DB
//

var Cloudant = require('cloudant');
var env;

// Cloudant NoSQL DB環境変数取得
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
if (appEnv.isLocal == true) {
    var services = require('../../vcap_services.json');
    env = "local";
} else {
    var services = JSON.parse(process.env.VCAP_SERVICES)
	env = "host";
};

srv = services["cloudantNoSQLDB Dedicated"];
var credentials = srv[0].credentials;

var un = credentials.username;
var pw = credentials.password;
var host = credentials.host;
var port = credentials.port;
var url = credentials.url;

var cloudant = Cloudant({ account: un, password: pw});
var approval_db = cloudant.db.use("approval_list");

var cradle = require('cradle');


//
// Load and Update Marble Data
//
router.get("/", (req, res, next) => {

	var type = "" // ejs or api
	type = req.query.type;

	var machine_type = model = "";
	machine_type = req.query.machine_type;
	model = req.query.model;
	mtm = machine_type + model

	// User IDからSquadを取得
	query = {
		"selector": {
			"MTM": mtm
		},
		"fields": [
			"_id",
			"_rev", 
			"MTM",
			"Product",
			"機種",
			"型式",
			"装置名",
			"保守廃止日",
			"保守延長期限",
			"延長可能期間",
			"予想Uplift",
			"Remark",
			"包括事前承認対象",
			"追加承認条件",
			"書簡番号"
		]
	}

	approval_db.find(query, function(err, body) {
		if (err) {
			throw err;
		}

		if (body.docs[0] != undefined) {
			if (body.docs[0].追加承認条件 == undefined) { body.docs[0].追加承認条件 = ""; }
			if (body.docs[0].書簡番号 == undefined) { body.docs[0].書簡番号 = ""; }
//			body.docs[0].追加承認条件 = body.docs[0].追加承認条件.trim(); // 本来はDBに登録する際にTrimされていれば不要
//			body.docs[0].書簡番号 = body.docs[0].書簡番号.trim(); // 本来はDBに登録する際にTrimされていれば不要
			body_docs = body.docs[0];
		} else {
			body_docs = {};
			body_docs.MTM = "",
			body_docs.Product = "",
			body_docs.機種 = "",
			body_docs.型式 = "",
			body_docs.装置名 = "",
			body_docs.保守廃止日 = "",
			body_docs.保守延長期限 = "",
			body_docs.延長可能期間 = "",
			body_docs.予想Uplift = "",
			body_docs.Remark = "",
			body_docs.包括事前承認対象 = "",
			body_docs.追加承認条件 = "",
			body_docs.書簡番号 = ""
		}

		if (type == "ejs") {
			res.render("./comprehensive_contract/result", 
			{ 
				body_docs: body_docs
			});
		} else if (type == "api") {
			res.header('Content-Type', 'application/json; charset=utf-8')
			res.send(body_docs);	
		}
	});
});

module.exports = router;