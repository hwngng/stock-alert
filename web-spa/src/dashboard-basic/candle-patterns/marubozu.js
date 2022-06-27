import common from "./common";

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

	dataSeries.forEach(day => {
		if (isWhiteMarubozu(day)) {
			resultPatterns.push([day]);
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

	dataSeries.forEach(day => {
		if (isBlackMarubozu(day)) {
			resultPatterns.push([day]);
		}
	});

	return resultPatterns;
}

