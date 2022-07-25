import common from "./common";
import patternMap from "../../common/patternMap";

export function whiteMarubozu(dataSeries) {
	const resultPatterns = [];
	const isWhiteMarubozu = function (tradingDay) {
		if (common.getSign(tradingDay) <= 0)
			return false;
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		if (lower > 0
			&& upperWick / lower < 0.0001
			&& lowerWick / lower < 0.0001
			&& body / lower >= common.getLargeBodyPercent())
			return true;

		return false;
	}

	dataSeries.forEach((day, idx) => {
		if (isWhiteMarubozu(day)) {
			const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
				patternMap.whiteMarubozu.preTrend,
				patternMap.whiteMarubozu.confirm,
				idx,
				idx);
			if (!preTrendFollow) {
				return;
			}
			resultPatterns.push({
				confirmation: confirmation,
				annotation: {
					date: day.date
				},
				candles: [day]
			});
		}
	});

	return resultPatterns;
}

export function blackMarubozu(dataSeries) {
	const resultPatterns = [];
	const isBlackMarubozu = function (tradingDay) {
		if (common.getSign(tradingDay) >= 0)
			return false;
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		if (lower > 0
			&& upperWick / lower < 0.0001
			&& lowerWick / lower < 0.0001
			&& body / lower >= common.getLargeBodyPercent())
			return true;

		return false;
	}

	dataSeries.forEach((day, idx) => {
		if (isBlackMarubozu(day)) {
			const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
				patternMap.blackMarubozu.preTrend,
				patternMap.blackMarubozu.confirm,
				idx,
				idx);
			if (!preTrendFollow) {
				return;
			}
			resultPatterns.push({
				confirmation: confirmation,
				annotation: {
					date: day.date
				},
				candles: [day]
			});
		}
	});

	return resultPatterns;
}

