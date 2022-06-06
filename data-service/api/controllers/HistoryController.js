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
		
		let codes = req.query.codes;
		let fromTimestamp = req.query.epoch_sec_from;
		let toTimestamp = req.query.epoch_sec_to;
		let exchangeCodes = req.query.exchange_codes;

		if (!codes || !fromTimestamp) {
			error.err_code = 400;
			error.err_msg = 'Lack of required input';
			res.json(error);
			return;
		}
		
		// preprocess input
		codes = codes.split(',');
		fromTimestamp = (new Date(fromTimestamp*1000)).toISOString();
		toTimestamp = (toTimestamp ? new Date(toTimestamp * 1000) : new Date()).toISOString();
		if (exchangeCodes)
			exchangeCodes = exchangeCodes.split(',');
		
		const query = `SELECT "stock_id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"\
						FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id\
						WHERE "symbol" = ANY ($1) ${exchangeCodes ? 'and "exchange_code" = ANY ($4)': ''} and ($2 <= dt and  dt <= $3)\
						ORDER BY "symbol", "dt"`;
		const values = [codes, fromTimestamp, toTimestamp];
		if (exchangeCodes) {
			values.push(exchangeCodes);
		}

		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(query, values, function (err, results) {
				client.release();
				if (err) {
					return console.error('Error executing query', err.stack)
				}
				res.json(results.rows);
			});
		});	
	}
}