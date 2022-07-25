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
		let code = req.query.codes;
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
	},
	post: (req, res) => {
		const conn = req.conn;
		if (!conn) {
			res.status(500);
			return;
		}

		let ohlcs = req.body;

		if (!ohlcs || !Array.isArray(ohlcs) || ohlcs.length == 0) {
			error.err_code = 400;
			error.err_msg = 'Invalid input';
			res.status(400).json(error);
			return;
		}
		let paramOhlcs = ohlcs.map(ohlc => [ohlc['stock_id'],
		ohlc['dt'],
		ohlc['open'],
		ohlc['high'],
		ohlc['low'],
		ohlc['close'],
		ohlc['volume']]);

		const query = format(`INSERT INTO "stock_prices"("stock_id", "dt", "open", "high", "low", "close", "volume")
						VALUES %L ON CONFLICT ("stock_id", "dt") DO NOTHING`, paramOhlcs);
		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(query, [], function (err, results) {
				client.release();
				if (err) {
					console.error(err);
					error.err_code = err.code;
					error.err_msg = 'SQL insert error';
					return res.status(400).json({ errorCode: err.code });
				}
				let resObj = {
					inserted: results.rowCount
				}
				res.json(resObj);
			});
		});
	},
	put: (req, res) => {
		const conn = req.conn;
		if (!conn) {
			res.status(500);
			return;
		}
		let ohlcs = req.body;

		if (!ohlcs || !Array.isArray(ohlcs) || ohlcs.length == 0) {
			error.err_code = 400;
			error.err_msg = 'Invalid input';
			res.status(400).json(error);
			return;
		}

		const queries = ohlcs.map(ohlc => {
			const updateStm = 'UPDATE "stock_prices" SET';
			let setStm = '';
			let comma = '';
			if (!ohlc['stock_id'] || !ohlc['dt']) return '';
			if ("open" in ohlc) {
				setStm += format(comma + '"open" = %L', ohlc['open']);
				comma = ',';
			}
			if ('high' in ohlc) {
				setStm += format(comma + '"high" = %L', ohlc['high']);
				comma = ',';
			}
			if ('low' in ohlc) {
				setStm += format(comma + '"low" = %L', ohlc['low']);
				comma = ',';
			}
			if ('close' in ohlc) {
				setStm += format(comma + '"close" = %L', ohlc['close']);
				comma = ',';
			}
			if ('volume' in ohlc) {
				setStm += format(comma + '"volume" = %L', ohlc['volume']);
				comma = ',';
			}
			if (!setStm) {
				return '';
			}
			const whereStm = format('WHERE "stock_id" = %L AND "dt" = %L', ohlc['stock_id'], ohlc['dt']);

			return `${updateStm} ${setStm} ${whereStm}`;
		});
		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(queries.join(';'), [], function (err, results) {
				client.release();
				if (err) {
					console.error(err);
					error.err_code = err.code;
					error.err_msg = 'SQL update error';
					return res.status(400).json(err);
				}
				let resObj = {
					updated: results.rowCount //.filter(result => result.rowCount > 0)?.length
				}
				res.json(resObj);
			});
		});
	},
	delete: (req, res) => {
		const conn = req.conn;
		if (!conn) {
			res.status(500);
			return;
		}
		let deleteIds = req.body;

		if (!deleteIds || !Array.isArray(deleteIds) || deleteIds.length == 0) {
			error.err_code = 400;
			error.err_msg = 'Invalid input';
			res.status(400).json(error);
			return;
		}

		const deleteStm = 'DELETE FROM "stock_prices"';
		let whereCondtions = deleteIds.map(id => {
			let whereCondition = '';
			whereCondition += '(';
			if ("stock_id" in id) {
				whereCondition += format('"stock_id" = %L', id['stock_id']); 
			} else {
				return '';
			}

			if ("dt_from" in id) {
				whereCondition += format(' AND "dt" >= %L', id['dt_from']); 
			}

			if ("dt_to" in id) {
				whereCondition += format(' AND "dt" <= %L', id['dt_to']); 
			}
			whereCondition += ')';
			return whereCondition;
		});
		const whereStm =  'WHERE ' + whereCondtions.filter(condition => condition).join(' OR ');
		const query = `${deleteStm} ${whereStm}`;
		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(query, function (err, results) {
				client.release();
				if (err) {
					console.error(err);
					error.err_code = err.code;
					error.err_msg = 'SQL delete error';
					return res.status(400).json({ errorCode: err.code });
				}
				let resObj = {
					deleted: results.rowCount
				}
				res.json(resObj);
			});
		});
	},
}