'use strict'
const error = require('../../models/error');
const helper = require('../../utils/helper');
const format = require('pg-format');

module.exports = {
	get: (req, res) => {
		const conn = req.conn;
		if (!conn) {
			res.status(500);
			return;
		}

		let params = {
			codes: req.query.codes,
			all: req.query.all,
			top30: req.query.top30,
			exchangeCodes: req.query.exchangeCodes
		}

		for (const key in params) {
			if (!params[key])
				delete params[key];
		}


		if (Object.keys(params).length == 0) {
			error.err_code = 400;
			error.err_msg = 'Invalid input';
			res.json(error);
			return;
		}
		
		
		// preprocess input
		if (params.codes) {
			params.codes = params.codes.split(',');
		}
		if (params.exchangeCodes) {
			params.exchangeCodes = params.exchangeCodes.split(',');
		}
		if (params.all) {
			params.exchangeCodes = Object.values(req.exchangeCodeMap);
		}
		
		let paramCount = 1;
		const query = `SELECT "symbol", "exchange_code", "name", "short_name", "name_eng"\
						FROM "stock_tickers"
						WHERE 1=1
							${params.codes ? `AND "symbol" = ANY ($${paramCount++})`: ''}\
							${params.exchangeCodes ? `AND "exchange_code" = ANY ($${paramCount++})`: ''}\
							${params.top30 ? `AND "top30" = $${paramCount++}`: ''}\;`;
		const values = [];
		if (params.codes) values.push(params.codes);
		if (params.exchangeCodes) values.push(params.exchangeCodes);
		if (params.top30) values.push(params.top30);
		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(query, values, function (err, results) {
				client.release();
				if (err) {
					return console.error('Error executing query', err.stack)
				}
				let resObj = {
					version: req.config.infoVersion,
					count: results.rows.length,
					data: results.rows
				}
				res.json(resObj);
			});
		});	
	}
}