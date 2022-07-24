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
		const query = `SELECT "id", "symbol", "exchange_code", "name", "short_name", "name_eng"
						FROM "stock_tickers"
						WHERE 1=1
							${params.codes ? `AND "symbol" = ANY ($${paramCount++})` : ''}
							${params.exchangeCodes ? `AND "exchange_code" = ANY ($${paramCount++})` : ''}
							${params.top30 ? `AND "top30" = $${paramCount++}` : ''};`;
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
	},
	post: (req, res) => {
		const conn = req.conn;
		if (!conn) {
			res.status(500);
			return;
		}
		let stockInfos = req.body;

		if (!stockInfos || !Array.isArray(stockInfos) || stockInfos.length == 0) {
			error.err_code = 400;
			error.err_msg = 'Invalid input';
			res.status(400).json(error);
			return;
		}
		let paramStockInfos = stockInfos.map(stockInfo => [stockInfo['symbol'],
		stockInfo['exchangeCode'],
		stockInfo['name'],
		stockInfo['description'],
		stockInfo['shortName'],
		stockInfo['nameEng'],
		stockInfo['top30']]);

		const query = format(`INSERT INTO "stock_tickers"("symbol", "exchange_code", "name", "description", "short_name", "name_eng", "top30")
						VALUES %L ON CONFLICT ("symbol", "exchange_code") DO NOTHING`, paramStockInfos);
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
		let stockInfos = req.body;

		if (!stockInfos || !Array.isArray(stockInfos) || stockInfos.length == 0) {
			error.err_code = 400;
			error.err_msg = 'Invalid input';
			res.status(400).json(error);
			return;
		}

		const queries = stockInfos.map(stockInfo => {
			const updateStm = 'UPDATE "stock_tickers" SET';
			let setStm = '';
			let comma = '';
			if (!stockInfo['id']) return '';
			if ("exchangeCode" in stockInfo) {
				setStm += format(comma + '"exchange_code" = %L', stockInfo['exchangeCode']);
				comma = ',';
			}
			if ('name' in stockInfo) {
				setStm += format(comma + '"name" = %L', stockInfo['name']);
				comma = ',';
			}
			if ('description' in stockInfo) {
				setStm += format(comma + '"description" = %L', stockInfo['description']);
				comma = ',';
			}
			if ('shortName' in stockInfo) {
				setStm += format(comma + '"short_name" = %L', stockInfo['shortName']);
				comma = ',';
			}
			if ('nameEng' in stockInfo) {
				setStm += format(comma + '"name_eng" = %L', stockInfo['nameEng']);
				comma = ',';
			}
			if ('top30' in stockInfo) {
				setStm += format(comma + '"top30" = %L', stockInfo['top30']);
				comma = ',';
			}
			if (!setStm) {
				return '';
			}
			const whereStm = format('WHERE "id" = %L', stockInfo['id']);

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
					updated: results.filter(result => result.rowCount > 0)?.length
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

		const query = 'DELETE FROM "stock_tickers"  WHERE "id" = ANY($1)';
		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(query, [deleteIds], function (err, results) {
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