import common from "./common";

export function doji(dataSeries) {
	const resultPatterns = [];
	const isDoji = function (tradingDay) {
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		let midBody = (upper+lower)/2;
		let midHeight = (tradingDay.high + tradingDay.low) / 2;
		let height = tradingDay.high - tradingDay.low;
		let maxBody = common.getLargeBodyPercent()*0.05;
		let minWick = common.getLargeBodyPercent()*0.3;

		if ((lower > 0 && body / lower <= maxBody)
			&& (tradingDay.low > 0 && height / tradingDay.low >= minWick)
			&& Math.abs(midHeight - midBody) < 0.12*height)
			return true;

		return false;
	}

	dataSeries.forEach(day => {
		if (isDoji(day)) {
			resultPatterns.push([day]);
		}
	});

	return resultPatterns;
}

export function longLeggedDoji(dataSeries) {
	const resultPatterns = [];
	const isLongLeggedDoji = function (tradingDay) {
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		let midBody = (upper+lower)/2;
		let midHeight = (tradingDay.high + tradingDay.low) / 2;
		let height = tradingDay.high - tradingDay.low;
		let maxBody = common.getLargeBodyPercent()*0.05;
		let minWick = common.getLargeBodyPercent()*0.3;

		if ((lower > 0 && body / lower <= maxBody)
			&& (tradingDay.low > 0 && height / tradingDay.low >= minWick)
			&& midBody - midHeight > 0.17*height
			&& midBody - midHeight < 0.4*height)
			return true;

		return false;
	}

	dataSeries.forEach(day => {
		if (isLongLeggedDoji(day)) {
			resultPatterns.push([day]);
		}
	});

	return resultPatterns;
}

export function dragonflyDoji(dataSeries) {
	const resultPatterns = [];
	const isDragonflyDoji = function (tradingDay) {
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		let midBody = (upper+lower)/2;
		let midHeight = (tradingDay.high + tradingDay.low) / 2;
		let height = tradingDay.high - tradingDay.low;
		let maxBody = common.getLargeBodyPercent()*0.05;
		let minWick = common.getLargeBodyPercent()*0.3;

		if ((lower > 0 && body / lower <= maxBody)
			&& (tradingDay.low > 0 && height / tradingDay.low >= minWick)
			&& midBody - midHeight > 0.45*height)
			return true;

		return false;
	}

	dataSeries.forEach(day => {
		if (isDragonflyDoji(day)) {
			resultPatterns.push([day]);
		}
	});

	return resultPatterns;
}

export function gravestoneDoji(dataSeries) {
	const resultPatterns = [];
	const isGravestoneDoji = function (tradingDay) {
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		let midBody = (upper+lower)/2;
		let midHeight = (tradingDay.high + tradingDay.low) / 2;
		let height = tradingDay.high - tradingDay.low;
		let maxBody = common.getLargeBodyPercent()*0.05;
		let minWick = common.getLargeBodyPercent()*0.3;

		if ((lower > 0 && body / lower <= maxBody)
			&& (tradingDay.low > 0 && height / tradingDay.low >= minWick)
			&& midHeight - midBody > 0.45*height)
			return true;

		return false;
	}

	dataSeries.forEach(day => {
		if (isGravestoneDoji(day)) {
			resultPatterns.push([day]);
		}
	});

	return resultPatterns;
}