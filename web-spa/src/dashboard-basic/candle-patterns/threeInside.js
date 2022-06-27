import common from "./common";

export function threeInsideUp(dataSeries) {
	const resultPatterns = [];
	const isThreeInsideUpCandles = function(tradingDay1, tradingDay2, tradingDay3) {
		if (common.getSign(tradingDay1) >= 0) return false;
		if (common.getSign(tradingDay2) <= 0) return false;
		if (common.getSign(tradingDay3) <= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let upper3 = common.getUpperBody(tradingDay3);
		let lower3 = common.getLowerBody(tradingDay3);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6
		if ((lower1 > 0 && body1/lower1 >= minBody)
			&& (lower2 >= lower1 && upper2 < upper1 && body2 >= 0.2*body1)
			&& (lower3 < upper1 && upper3 > tradingDay1.high))
			return true;
		return false;
	}

	if (dataSeries.length >= 3) {
		for (let i = 2; i < dataSeries.length; ++i) {
			if (isThreeInsideUpCandles(dataSeries[i-2], dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-2], dataSeries[i-1], dataSeries[i]]);
				i += 3;
			}
		}
	}
	return resultPatterns;
}

export function threeInsideDown(dataSeries) {
	const resultPatterns = [];
	const isThreeInsideDownCandles = function(tradingDay1, tradingDay2, tradingDay3) {
		if (common.getSign(tradingDay1) <= 0) return false;
		if (common.getSign(tradingDay2) >= 0) return false;
		if (common.getSign(tradingDay3) >= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let upper3 = common.getUpperBody(tradingDay3);
		let lower3 = common.getLowerBody(tradingDay3);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6;
		if ((lower1 > 0 && body1/lower1 >= minBody)
			&& (lower2 >= lower1 && upper2 < upper1 && body2 >= 0.2*body1)
			&& (upper3 > lower1 && lower3 < tradingDay1.low))
			return true;
		return false;
	}

	if (dataSeries.length >= 3) {
		for (let i = 2; i < dataSeries.length; ++i) {
			if (isThreeInsideDownCandles(dataSeries[i-2], dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-2], dataSeries[i-1], dataSeries[i]]);
				i += 3;
			}
		}
	}
	return resultPatterns;
}

