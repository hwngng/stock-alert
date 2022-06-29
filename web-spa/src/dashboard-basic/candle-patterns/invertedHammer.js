import common from "./common";

export default function invertedHammerCandle(dataSeries) {
	const resultPatterns = [];
	const isInvertedHammerCandle = function(tradingDay) {
		let result = true;
		let upper = tradingDay.close;
		let lower = tradingDay.open;
		if (tradingDay.close < tradingDay.open) {
			upper = tradingDay.open;
			lower = tradingDay.close;
		}
		let upperWick = tradingDay.high - upper;
		let lowerWick = lower - tradingDay.low;
		let body = upper - lower;
		let height = tradingDay.high - tradingDay.low;
		let minBody = common.getLargeBodyPercent() * 0.05;
		let minWick = common.getLargeBodyPercent() * 0.5;
		if (height == 0)
			return false;
		if ((lower > 0 && body / lower > minBody) &&
			body/height > 0.1 &&
			lowerWick/height < 0.05 &&
			upperWick >= 2*body &&
			(tradingDay.low > 0 && height / tradingDay.low >= minWick))
			return true;

		return false;
	}

	dataSeries.forEach(day => {
		if (isInvertedHammerCandle(day)) {
			resultPatterns.push([day]);
		}
	});

	return resultPatterns;
}

