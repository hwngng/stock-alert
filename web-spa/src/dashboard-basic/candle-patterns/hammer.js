import patternMap from "../../common/patternMap";
import common from "./common";

export default function hammerCandle(dataSeries) {
	const resultPatterns = [];
	const isHammerCandle = function (tradingDay) {
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
		if ((lower > 0 && body / lower >= minBody) &&
			body / height > 0.15 &&
			upperWick / height < 0.05 &&
			lowerWick >= 2 * body &&
			(tradingDay.low > 0 && height / tradingDay.low >= minWick))
			return true;

		return false;
	}

	dataSeries.forEach((day, idx) => {
		if (isHammerCandle(day)) {
			const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
																		patternMap.hammerCandle.preTrend,
																		patternMap.hammerCandle.confirm,
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

