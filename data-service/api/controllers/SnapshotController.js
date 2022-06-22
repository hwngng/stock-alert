'use strict'

const utils = require('../../utils');
const axios = require('axios');

module.exports = {
	get: (req, res) => {
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
		axios.get('https://price-api.vndirect.com.vn/stocks/snapshot', {
			params: params
		})
		.then(function (response) {
			let stockData = response.data;
			if (!Array.isArray(stockData))
				return;
			for (let i = 0; i < stockData.length; ++i) {
				stockData[i] = utils.vnd.mapObjVND(utils.vnd.decodeVNDdata(stockData[i]));
			}
			res.json(stockData);
		})
		.catch(function (err) {
			console.log(err);
			res.json([]);
		});
	}
}