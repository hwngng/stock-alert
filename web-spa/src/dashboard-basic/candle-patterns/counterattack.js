import common from "./common";

export function bullishCounterAttack(dataSeries) {
	const resultPatterns = [];
	const isBullishCounterAttackCandles = function(tradingDay1, tradingDay2) {
		if (common.getSign(tradingDay1) >= 0) return false;
		if (common.getSign(tradingDay2) <= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.5;
		if ((lower1 > 0 && body1/lower1 >= minBody)
			&& Math.abs(body1-body2)/Math.max(body1, body2) < 0.25
			&& (Math.abs(lower1 - upper2)/Math.min(lower1, upper2) < 0.002))
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isBullishCounterAttackCandles(dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-1], dataSeries[i]]);
				i += 2;
			}
		}
	}
	return resultPatterns;
}

export function bearishCounterAttack(dataSeries) {
	const resultPatterns = [];
	const isBearishCounterAttackCandles = function(tradingDay1, tradingDay2) {
		if (common.getSign(tradingDay1) <= 0) return false;
		if (common.getSign(tradingDay2) >= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.5;
		if ((lower1 > 0 && body1/lower1 >= minBody)
			&& Math.abs(body1-body2)/Math.max(body1, body2) < 0.25
			&& (Math.abs(upper1 - lower2)/Math.min(upper1, lower2) < 0.002))
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isBearishCounterAttackCandles(dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-1], dataSeries[i]]);
				i += 2;
			}
		}
	}
	return resultPatterns;
}

