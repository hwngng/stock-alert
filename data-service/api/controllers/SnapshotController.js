'use strict'

const utils = require('../../utils');
const axios = require('axios');

module.exports = {
	get: (req, res) => {
		const conn = req.conn;
		if (!conn) {
			res.status(500);
			return;
		}

		let params = {
			code: req.query.codes,
			all: req.query.all,
			top30: req.query.top30,
			floorCode: req.query.exchangeCodes
		}
		for (const key in params) {
			if (!params[key])
				delete params[key];
			else if (Array.isArray(params[key])) {
				params[key] = params[key].join(',');
			}
		}

		if (Object.keys(params).length === 0) {
			res.json([]);
			return;
		}

		if (params['all']) {
			params['floorCode'] = Object.values(req.exchangeCodeMap).join(',');
			delete params['all'];
		}
		let paramsQuery = {}
		// preprocess input
		if (params.code) {
			paramsQuery.codes = params.code.split(',');
		}
		if (params.floorCode) {
			paramsQuery.exchangeCodes = params.floorCode.split(',');
		}
		paramsQuery.top30 = params.top30;
		let paramCount = 1;
		const query = `SELECT "symbol", "exchange_code", "name", "short_name", "name_eng"
						FROM "stock_tickers"
						WHERE 1=1
							${paramsQuery.codes ? `AND "symbol" = ANY ($${paramCount++})` : ''}
							${paramsQuery.exchangeCodes ? `AND "exchange_code" = ANY ($${paramCount++})` : ''}
							${paramsQuery.top30 ? `AND "top30" = $${paramCount++}` : ''};`;
		const values = [];
		if (paramsQuery.codes) values.push(paramsQuery.codes);
		if (paramsQuery.exchangeCodes) values.push(paramsQuery.exchangeCodes);
		if (paramsQuery.top30) values.push(paramsQuery.top30);
		conn.connect(function (err, client, result) {
			if (err) {
				return console.error('Error acquiring client', err.stack)
			}
			client.query(query, values, function (err, results) {
				client.release();
				if (err) {
					return console.error('Error executing query', err.stack)
				}
				let stocks = results.rows;
				let symbols = stocks.map(x => x['symbol']);
				let stocksDict = Object.assign({}, ...stocks.map(s => ({ [s['symbol']]: s })));
				axios.get('https://price-api.vndirect.com.vn/stocks/snapshot', {
					params: { code: symbols?.join(',') }
				})
					.then(function (response) {
						let stockData = response.data;
						if (!Array.isArray(stockData))
							return;
						let vndSymbols = [];
						for (let i = 0; i < stockData.length; ++i) {
							stockData[i] = utils.vnd.mapObjVND(utils.vnd.decodeVNDdata(stockData[i]));
							vndSymbols.push(stockData[i]['Symbol']);
						}
						let localSymbolsSet = new Set(symbols);
						let vndSymbolsSet = new Set(vndSymbols);
						let remainedSymbols = utils.helper.set.difference(localSymbolsSet, vndSymbolsSet);

						remainedSymbols.forEach((key, value) => {
							stockData.push({
								"Symbol": value,
								"StockType": "SMA",
								"ExchangeCode": stocksDict[value]?.exchange_code,
								"RefPrice": 10,
								"FloorPrice": 9.3,
								"CeilingPrice": 10.7,
								"AccumulatedVal": 0,
								"AccumulatedVol": 0
							});
						});
						res.json(stockData);
					})
					.catch(function (err) {
						console.log(err);
						res.json([]);
					});
			});
		});
	}
}