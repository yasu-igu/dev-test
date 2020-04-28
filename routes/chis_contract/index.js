//
// Mood marble top page (index)
//
console.log("[chis_contract/search.js] CHIS契約情報検索")

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
var chis_contract_db = cloudant.db.use("chis_contract_data");

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

	search_type = req.query.search_type;
	if (search_type == undefined) {
		search_type = "all";
	}

	mtype = req.query.mtype;
	model = req.query.model;
  serial = req.query.serial;
  install = req.query.install;
  warrantyend = req.query.warrantyend;
  usingcustmer = req.query.usingcustmer;
  effective_start = req.query.effective_start;
  effective_end = req.query.effective_end;

  if (mtype == undefined) {
    mtype = "";
  }

	if (model == undefined) {
		model = "";
	}

  if (serial == undefined) {
    serial = "";
  }

  if (install == undefined) {
    install = "";
  }

  if (warrantyend == undefined) {
    warrantyend = "";
  }

  if (usingcustmer == undefined) {
    usingcustmer = "";
  }

  if (effective_start == undefined) {
    effective_start = "";
  }

  if (effective_end == undefined) {
    effective_end = "";
  }


	switch (search_type) {
		case "all":
			selector = '{}';
			break;
		case "search": // progress = On Going, Delay & category != sysmod
//		selector = '{ "$or" : [ {"$and": [ { "MTYPE": { "$eq": "' + mtype + '" } }, { "MODEL": { "$eq": "' + model + '" } } ] } , { "$eq": [ { "INSTALL": { "$eq": "' + install + '" } } ] }  ] }';
//    selector = '{ "$or" : [ {"$and": [ { "MTYPE": { "$eq": "' + mtype + '" } }, { "MODEL": { "$eq": "' + model + '" } } ] } , {  "INSTALL": "' + install + '"   }  ] }';
//    selector = '{ "$or" : [ { "MTYPE": "' + mtype + '" } , { "MODEL": "' + model + '" } , { "SERIAL": "' + serial + '" } , { "INSTALL": "' + install + '" } , { "WARRANTYEND": "' + warrantyend + '" } , { "USINGCUSTMER": "' + usingcustmer + '" } , { "EFFECTIVE_START": "' + effective_start + '" } , { "EFFECTIVE_END": "' + effective_end + '" }  ] }';
selector = '{"$or": [ { "MTYPE": { "$and" : [ { "$eq": "' + mtype + '" } , { "$not": { "$eq": ""} } ] } } , { "MODEL": { "$and" : [ { "$eq": "' + model + '" } , { "$not": { "$eq": ""} } ] } } , { "INSTALL": { "$and" : [ { "$eq": "' + install + '" } , { "$not": { "$eq": ""} } ] } } , { "WARRANTYEND": { "$and" : [ { "$eq": "' + warrantyend + '" } , { "$not": { "$eq": " "} } ] } } , { "USINGCUSTMER": { "$and" : [ { "$eq": "' + usingcustmer + '" } , { "$not": { "$eq": ""} } ] } } ,{ "EFFECTIVE_START": { "$and" : [ { "$eq": "' + effective_start + '" } , { "$not": { "$eq": ""} } ] } } ,  { "EFFECTIVE_END": { "$and" : [ { "$eq": "' + effective_end + '" } , { "$not": { "$eq": ""} } ] } } ] }';
//      selector = '{ "INSTALL": "' + install + '"  }';

			break;
/*
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
*/
	}

	selector = JSON.parse(selector);

	// User IDからSquadを取得
	query = {
		"selector": selector,
		"fields": [
      "_id", "_rev",
			"INVENTORYID",
			"MTYPE",
			"MODEL",
			"SERIAL",
			"INSTALL",
			"WARRANTYEND",
			"USINGCUSTMER",
			"USING_CUST_NAME",
			"DESCRIPTION",
			"TOM",
			"EOS",
			"BASEPRICETOTAL",
			"CONTRACTID",
      "COMPONENTID",
      "PACKAGEID",
      "PONUMBER",
      "CUSTSIGNDATE",
      "CONTSTART",
      "CONTSTOP",
      "EFFECTIVE_START",
      "EFFECTIVE_END",
      "CONTRACTTYPE",
      "OFF_IOFFNIK",
      "SLC",
      "SALESCHANNEL",
      "BILLINGFRQ",
      "FINANCIALENDMTH",
      "SIGN_CUST_NO",
      "SALESORG_CUST_NO",
      "SALESORG_AGENT",
      "AGENTID",
      "BILLING_CUST_NO",
      "BILLING_EXT",
      "BILLEDAMOUNT",
			"BILLED_PRICE"

		]
	}

//	console.log(selector);

	chis_contract_db.find(query, function(err, body) {
		if (err) {
			throw err;
		}

		body_docs = body.docs;
//		console.log(">", body_docs);
console.log(body.docs);
/*
		//
		// Status = ALLの時、Download用のCSVファイルを作成する
		//
		if (status == "all") {
			csv = "_id, _rev, business, category, feature, investment, benefits, progress, backlog_date, si_plan, si_date, lead_time, cycle_time, squad\n";

			for (i = 0; i < body.docs.length; i++) {
				csv += body.docs[i]._id + ",";
				csv += body.docs[i]._rev + ",";

				csv += body.docs[i].business + ",";
				csv += body.docs[i].category + ",";
				csv += body.docs[i].feature + ",";
				csv += body.docs[i].investment + ",";
				csv += body.docs[i].benefit + ",";
				csv += body.docs[i].progress + ",";
				csv += body.docs[i].backlog_date + ",";
				csv += body.docs[i].si_plan + ",";
				csv += body.docs[i].si_Date + ",";
				csv += body.docs[i].lead_time + ",";
				csv += body.docs[i]._cycle_time + ",";
				csv += body.docs[i].squad + "\n";
			}
			csv = csv.slice(0, -1);

			fs.writeFile("public/tss_portal_all_data.csv", csv, function (err) {
				if (err) {
					throw err;
				}
			});
		}
*/

		// console.log(body_docs);

		if (type == "ejs") {
			res.render("./tss_portal/index",
			{
				body_docs: body_docs,
//				status: status
			});
		} else if (type == "api") {
			res.header('Content-Type', 'application/json; charset=utf-8')
			res.send(body_docs);
		}
	});
});

module.exports = router;
