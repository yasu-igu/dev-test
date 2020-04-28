//
// Mood marble top page (index)
//
console.log("[./search.js] TSS Portal Funnel Search")

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
var tss_portal_db = cloudant.db.use("tss_portal");

var cradle = require('cradle');

var fs = require('fs');

//
// Load and Update Marble Data
//
router.get("/", (req, res, next) => {
console.log("test");
	var type = "" // ejs or api
	type = req.query.type;
	if (type == undefined) {
		type = "ejs";
	}

	//	status : all, ongoing, backlog, sysmod, release
	status = req.query.status;
	if (status == undefined) {
		status = "ongoing";
	}

	switch (status) {
		case "all":
			selector = '{}';
			break;
		case "ongoing": // progress = On Going, Delay & category != sysmod
			selector = '{ "$and": [ { "category": { "$ne": "Sysmod" } }, { "progress": { "$or": [ { "$eq": "On Going" }, { "$eq": "Delay" } ] } } ] }';
			break;
    case "technicaldebt": // category = sysmod
  		selector = '{ "category": { "$eq": "Technical Debt" } }';
  		break;
		case "backlog": // progress = Backlog & category != sysmod
			selector = '{ "$and": [ { "category": { "$ne": "Sysmod" } }, { "progress": { "$eq": "Backlog" } } ] }';
			break;
		case "sysmod": // category = sysmod
			selector = '{ "category": { "$eq": "Sysmod" } }';
			break;
		case "release": // S/I Date is not empty
			selector = '{ "$and": [ { "category": { "$ne": "Sysmod" } }, { "progress": { "$nor": [ { "$eq": "On Going" }, { "$eq": "Delay" }, { "$eq": "Backlog" } ] } } ] }';
			break;
		default:
	}

	selector = JSON.parse(selector);

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
//		console.log(">", body_docs);

		//
		// Status = ALLの時、Download用のCSVファイルを作成する
		//
		if (status == "all") {
			csv = "_id, _rev, no, business, category, feature, investment, benefits, progress, backlog_date, start_date, si_plan, si_date, lead_time, cycle_time, squad\n";

			for (i = 0; i < body.docs.length; i++) {
				csv += body.docs[i]._id + ",";
				csv += body.docs[i]._rev + ",";

				csv += body.docs[i].no + ",";
        csv += body.docs[i].business + ",";
				csv += body.docs[i].category + ",";
				csv += body.docs[i].feature + ",";
				csv += body.docs[i].investment + ",";
				csv += body.docs[i].benefit + ",";
				csv += body.docs[i].progress + ",";
				csv += body.docs[i].backlog_date + ",";
        csv += body.docs[i].start_date + ",";
				csv += body.docs[i].si_plan + ",";
				csv += body.docs[i].si_Date + ",";
				csv += body.docs[i].lead_time + ",";
				csv += body.docs[i].cycle_time + ",";
				csv += body.docs[i].squad + "\n";
			}
			csv = csv.slice(0, -1);

			fs.writeFile("public/tss_portal_all_data.csv", csv, function (err) {
				if (err) {
					throw err;
				}
			});
		}

		// console.log(body_docs);

		if (type == "ejs") {
			res.render("./tss_portal/index",
			{
				body_docs: body_docs,
				status: status
			});
		} else if (type == "api") {
			res.header('Content-Type', 'application/json; charset=utf-8')
			res.send(body_docs);
		}
	});
});

module.exports = router;
