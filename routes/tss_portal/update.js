//
// Mood marble top page (index)
//
console.log("[tss_portal/update.js] TSS Portal Funnel update")

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
//var host = credentials.host;
//var port = credentials.port;
//var url = credentials.url;

var cloudant = Cloudant({ account: un, password: pw});
var tss_portal_db = cloudant.db.use("tss_portal");

var cradle = require('cradle');

var fs = require('fs');

//
// Load and Update Marble Data
//
router.get("/", (req, res, next) => {

	var type = "" // ejs or api
	type = req.query.type;
	if (type == undefined) {
		type = "ejs";
	}

	id = req.query.id;
	action = req.query.action; // select, new, update, delete (tbd)
//	update_docs = {};
	update_docs = req.query.update_docs; // update時のみ使用

	if (action == "select") {

		selector = '{ "_id": "' + id + '" }';
		selector = JSON.parse(selector)

		// User IDからSquadを取得
		query = {
			"selector": selector,
			"fields": [
				"_id", "_rev",
				"no",
        "business",
				"category",
				"feature",
				"investment",
				"benefits",
				"progress",
				"backlog_date",
        "start_date",
				"si_plan",
				"si_date",
				"lead_time",
				"cycle_time",
				"squad"
			]
		}

		tss_portal_db.find(query, function(err, body) {
			if (err) {
				throw err;
			}

			body_docs = body.docs;
			console.log(body_docs);

			if (type == "ejs") {
				res.render("./tss_portal/update",
				{
					body_docs: body_docs,
//					status: status
				});
//			} else if (type == "api") {
//				res.header('Content-Type', 'application/json; charset=utf-8')
//				res.send(body_docs);
			}
		});
	} else if (action == "update") {
		update_docs = JSON.parse(update_docs);
		console.log("update_docs - update:\n", update_docs);

		if (update_docs._id == "") {
			update_docs._id = undefined;
		}
		if (update_docs._rev == "") {
			update_docs._rev = undefined;
		}


		tss_portal_db.insert(update_docs, function(err, body) {
   		 	if (err) {
				console.log("[/TSS_Portal/update.js] Error:", JSON.stringify(body));
				// throw err;
			} else {
				console.log("[/TSS_Portal/update.js] Done:", body.ok);
			}
			res.redirect("/tss_portal/index.html");
		});
	} else if (action == "new") {
		body_docs = [];
		body_docs[0] = {};
		body_docs[0]._id = "";
		body_docs[0].rev = "";
		body_docs[0].no = "";
    body_docs[0].business = "";
		body_docs[0].category = "";
		body_docs[0].feature = "";
		body_docs[0].investment = "";
		body_docs[0].benefits = "";
		body_docs[0].progress = "";
		body_docs[0].backlog_date = "";
    body_docs[0].start_date = "";
		body_docs[0].si_plan = "";
		body_docs[0].si_date = "";
		body_docs[0].lead_time = "";
		body_docs[0].cycle_time = "";
		body_docs[0].squad = "";

		if (type == "ejs") {
			res.render("./tss_portal/update",
			{
			});
		}
	} else if (action == "delete") {
		update_docs = JSON.parse(update_docs);
		console.log("update_docs - delete:\n", update_docs);

		tss_portal_db.destroy(update_docs._id, update_docs._rev, function(er3, body) {
			if (er3) {
				console.log("DB Access Error!!!");
			} else {
				console.log("Deleate Record");
			}

			res.redirect("/tss_portal/index.html");
		});
	}

});

module.exports = router;
