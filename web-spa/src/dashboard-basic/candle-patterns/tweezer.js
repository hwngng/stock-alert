import common from "./common";

export function tweezerTop(dataSeries) {
	const resultPatterns = [];
	const isTweezerTopCandles = function(tradingDay1, tradingDay2) {
		if (common.getSign(tradingDay1) <= 0) return false;
		if (common.getSign(tradingDay2) >= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6;
		if ((lower1 > 0 && body1/lower1 >= minBody)
			&& (lower2 > 0 && body2/lower2 >= minBody)
			&& Math.abs(body1-body2)/Math.max(body1, body2) < 0.3
			&& (Math.abs(tradingDay1.high - tradingDay2.high)/Math.min(tradingDay1.high, tradingDay2.high) < 0.008
				|| (Math.abs(upper1 - upper2)/Math.min(upper1, upper2) < 0.008)))
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isTweezerTopCandles(dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-1], dataSeries[i]]);
				i += 2;
			}
		}
	}
	return resultPatterns;
}

export function tweezerBottom(dataSeries) {
	const resultPatterns = [];
	const isTweezerBottomCandles = function(tradingDay1, tradingDay2) {
		if (common.getSign(tradingDay1) >= 0) return false;
		if (common.getSign(tradingDay2) <= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6;
		if ((lower1 > 0 && body1/lower1 >= minBody)
			&& (lower2 > 0 && body2/lower2 >= minBody)
			&& Math.abs(body1-body2)/Math.max(body1, body2) < 0.3
			&& (Math.abs(tradingDay1.low - tradingDay2.low)/Math.min(tradingDay1.low, tradingDay2.low) < 0.008
				|| (Math.abs(lower1 - lower2)/Math.min(lower1, lower2) < 0.008)))
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isTweezerBottomCandles(dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-1], dataSeries[i]]);
				i += 2;
			}
		}
	}
	return resultPatterns;
}