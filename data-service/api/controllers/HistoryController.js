'use strict'
const error = require('../../models/error');
const helper = require('../../utils/helper');
const format = require('pg-format');
const axios = require('axios');

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

		if (!codes) {
			error.err_code = 400;
			error.err_msg = 'Lack of required input';
			res.json(error);
			return;
		}
		
		// preprocess input
		codes = codes.split(',');
		fromTimestamp = (fromTimestamp ? new Date(fromTimestamp*1000) : new Date(915148800000)).toISOString();
		toTimestamp = (toTimestamp ? new Date(toTimestamp * 1000) : new Date()).toISOString();
		if (exchangeCodes)
			exchangeCodes = exchangeCodes.split(',');
		
		const query = `SELECT "stock_id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"\
						FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id\
						WHERE "symbol" = ANY ($1)\
							AND ($2 <= dt and  dt <= $3)\
							${exchangeCodes ? 'AND "exchange_code" = ANY ($4)': ''}\
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
	},
	getSingleWithCurrent: (req, res) => {
		let code = req.query.code;
		let fromTimestamp = req.query.epoch_sec_from;
		let toTimestamp = req.query.epoch_sec_to;

		if (!code) {
			error.err_code = 400;
			error.err_msg = 'Lack of required input';
			res.json(error);
			return;
		}

		fromTimestamp = fromTimestamp ? fromTimestamp : 915148800;
		toTimestamp = toTimestamp ? toTimestamp : Date()/1000;

		let params = {
			symbol: code,
			from: fromTimestamp,
			to: toTimestamp
		};
		params = helper.dropFalsyFields(params);
		axios.get('https://dchart-api.vndirect.com.vn/dchart/history', {
			params: params
		})
		.then(function (response) {
			let ohlcv = response.data;
			if (!ohlcv || ohlcv['s'] != 'ok') {
				console.log(response.data);
				res.json([]);
				return;
			}
			let ohlcvArr = ohlcv['t'].map((t, idx) => ({
				symbol: code,
				dt: (new Date(t*1000)).toISOString(),
				open: ohlcv['o'][idx],
				high: ohlcv['h'][idx],
				low: ohlcv['l'][idx],
				close: ohlcv['c'][idx],
				volume: ohlcv['v'][idx]
			}));
			res.json(ohlcvArr);
		})
		.catch(function (err) {
			console.log(err);
			res.json([]);
		});
	}
}