import common from "./common";
import patternMap from "../../common/patternMap";

export function fallingThreeMethods(dataSeries) {
	const resultPatterns = [];
	const isFallingThreeMethodsCandles = function (tradingDay1, tradingDay2, tradingDay3, tradingDay4, tradingDay5) {
		if (common.getSign(tradingDay1) >= 0) return false;
		if (common.getSign(tradingDay2) <= 0) return false;
		if (common.getSign(tradingDay3) <= 0) return false;
		if (common.getSign(tradingDay4) <= 0) return false;
		if (common.getSign(tradingDay5) >= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let upper3 = common.getUpperBody(tradingDay3);
		let lower3 = common.getLowerBody(tradingDay3);
		let upper4 = common.getUpperBody(tradingDay4);
		let lower4 = common.getLowerBody(tradingDay4);
		let upper5 = common.getUpperBody(tradingDay5);
		let lower5 = common.getLowerBody(tradingDay5);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let body3 = upper3 - lower3;
		let body4 = upper4 - lower4;
		let body5 = upper5 - lower5;
		let largeBodyMin = common.getLargeBodyPercent() * 0.6;
		let smallBodyMin = common.getLargeBodyPercent() * 0.15;
		let firstBody = lower1 > 0 ? body1 / lower1 : 0;
		if ((lower1 > 0 && body1 / lower1 >= largeBodyMin)
			&& (lower2 > 0 && body2 / lower2 >= smallBodyMin && body2 / lower2 <= firstBody/2)
			&& (lower3 > 0 && body3 / lower3 >= smallBodyMin && body3 / lower3 <= firstBody/2)
			&& (lower4 > 0 && body4 / lower4 >= smallBodyMin && body4 / lower4 <= firstBody/2)
			&& (lower5 > 0 && body5 / lower5 >= largeBodyMin)
			&& (upper2 < upper3 && upper3 < upper4)
			&& lower1 >= lower5)
			return true;
		return false;
	}

	if (dataSeries.length >= 5) {
		for (let i = 4; i < dataSeries.length; ++i) {
			if (isFallingThreeMethodsCandles(dataSeries[i - 4], dataSeries[i - 3], dataSeries[i - 2], dataSeries[i - 1], dataSeries[i])) {
				const confirmation  = common.computeContinuousTrend(dataSeries,
					patternMap.fallingThreeMethods.preTrend,
					patternMap.fallingThreeMethods.confirm,
					i - 4,
					i);
				resultPatterns.push({
					confirmation: confirmation,
					annotation: {
						date: dataSeries[i - 2].date
					},
					candles: [dataSeries[i - 4], dataSeries[i - 3], dataSeries[i - 2], dataSeries[i - 1], dataSeries[i]]
				});
				i += 5;
			}
		}
	}
	return resultPatterns;
}

export function risingThreeMethods(dataSeries) {
	const resultPatterns = [];
	const isRisingThreeMethodsCandles = function (tradingDay1, tradingDay2, tradingDay3, tradingDay4, tradingDay5) {
		if (common.getSign(tradingDay1) <= 0) return false;
		if (common.getSign(tradingDay2) >= 0) return false;
		if (common.getSign(tradingDay3) >= 0) return false;
		if (common.getSign(tradingDay4) >= 0) return false;
		if (common.getSign(tradingDay5) <= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let upper3 = common.getUpperBody(tradingDay3);
		let lower3 = common.getLowerBody(tradingDay3);
		let upper4 = common.getUpperBody(tradingDay4);
		let lower4 = common.getLowerBody(tradingDay4);
		let upper5 = common.getUpperBody(tradingDay5);
		let lower5 = common.getLowerBody(tradingDay5);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let body3 = upper3 - lower3;
		let body4 = upper4 - lower4;
		let body5 = upper5 - lower5;
		let largeBodyMin = common.getLargeBodyPercent() * 0.6;
		let smallBodyMin = common.getLargeBodyPercent() * 0.15;
		let firstBody = lower1 > 0 ? body1 / lower1 : 0;
		if ((lower1 > 0 && body1 / lower1 >= largeBodyMin)
			&& (lower2 > 0 && body2 / lower2 >= smallBodyMin && body2 / lower2 <= firstBody/2)
			&& (lower3 > 0 && body3 / lower3 >= smallBodyMin && body3 / lower3 <= firstBody/2)
			&& (lower4 > 0 && body4 / lower4 >= smallBodyMin && body4 / lower4 <= firstBody/2)
			&& (lower5 > 0 && body5 / lower5 >= largeBodyMin)
			&& (lower2 > lower3 && lower3 > lower4)
			&& upper1 <= upper5)
			return true;
		return false;
	}

	if (dataSeries.length >= 5) {
		for (let i = 4; i < dataSeries.length; ++i) {
			if (isRisingThreeMethodsCandles(dataSeries[i - 4], dataSeries[i - 3], dataSeries[i - 2], dataSeries[i - 1], dataSeries[i])) {
				const confirmation  = common.computeContinuousTrend(dataSeries,
					patternMap.risingThreeMethods.preTrend,
					patternMap.risingThreeMethods.confirm,
					i - 4,
					i);
				resultPatterns.push({
					confirmation: confirmation,
					annotation: {
						date: dataSeries[i - 2].date
					},
					candles: [dataSeries[i - 4], dataSeries[i - 3], dataSeries[i - 2], dataSeries[i - 1], dataSeries[i]]
				});
				i += 5;
			}
		}
	}
	return resultPatterns;
}



