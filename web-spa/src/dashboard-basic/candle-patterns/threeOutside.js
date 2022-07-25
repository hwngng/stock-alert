import common from "./common";
import patternMap from "../../common/patternMap";

export function threeOutsideUp(dataSeries) {
	const resultPatterns = [];
	const isThreeOutsideUpCandles = function(tradingDay1, tradingDay2, tradingDay3) {
		if (common.getSign(tradingDay1) >= 0) return false;
		if (common.getSign(tradingDay2) <= 0) return false;
		if (common.getSign(tradingDay3) < 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let upper3 = common.getUpperBody(tradingDay3);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6;
		if ((lower2 > 0 && body2/lower2 >= minBody)
			&& (upper1 < upper2 && lower1 > lower2)
			&& (body2 - body1) > 0.2*body2
			&& (upper3 > upper2))
			return true;
		return false;
	}

	if (dataSeries.length >= 3) {
		for (let i = 2; i < dataSeries.length; ++i) {
			if (isThreeOutsideUpCandles(dataSeries[i-2], dataSeries[i-1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.threeOutsideUp.preTrend,
					patternMap.threeOutsideUp.confirm,
					i - 2,
					i);
				if (!preTrendFollow) {
					continue;
				}
				resultPatterns.push({
					confirmation: confirmation,
					annotation: {
						date: dataSeries[i - 1].date
					},
					candles: [dataSeries[i - 2], dataSeries[i - 1], dataSeries[i]]
				});
				i += 3;
			}
		}
	}
	return resultPatterns;
}

export function threeOutsideDown(dataSeries) {
	const resultPatterns = [];
	const isThreeOutsideDownCandles = function(tradingDay1, tradingDay2, tradingDay3) {
		if (common.getSign(tradingDay1) <= 0) return false;
		if (common.getSign(tradingDay2) >= 0) return false;
		if (common.getSign(tradingDay3) > 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let upper3 = common.getUpperBody(tradingDay3);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6;
		if ((lower2 > 0 && body2/lower2 >= minBody)
			&& (upper1 < upper2 && lower1 > lower2)
			&& (body2 - body1) > 0.2*body2
			&& (upper3 < upper2))
			return true;
		return false;
	}

	if (dataSeries.length >= 3) {
		for (let i = 2; i < dataSeries.length; ++i) {
			if (isThreeOutsideDownCandles(dataSeries[i-2], dataSeries[i-1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.threeOutsideDown.preTrend,
					patternMap.threeOutsideDown.confirm,
					i - 2,
					i);
				if (!preTrendFollow) {
					continue;
				}
				resultPatterns.push({
					confirmation: confirmation,
					annotation: {
						date: dataSeries[i - 1].date
					},
					candles: [dataSeries[i - 2], dataSeries[i - 1], dataSeries[i]]
				});
				i += 3;
			}
		}
	}
	return resultPatterns;
}

