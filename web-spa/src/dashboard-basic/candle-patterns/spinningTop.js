import common from "./common";
import patternMap from "../../common/patternMap";

export function spinningTop(dataSeries) {
	const resultPatterns = [];
	const isSpinningTop = function (tradingDay) {
		let upperWick = common.getUpperWick(tradingDay);
		let lowerWick = common.getLowerWick(tradingDay);
		let upper = common.getUpperBody(tradingDay);
		let lower = common.getLowerBody(tradingDay);
		let body = upper - lower;
		let midBody = (upper+lower)/2;
		let midHeight = (tradingDay.high + tradingDay.low) / 2;
		let height = tradingDay.high - tradingDay.low;
		let maxBody = common.getLargeBodyPercent()*0.2;
		let minBody = common.getLargeBodyPercent()*0.05;
		let minWick = common.getLargeBodyPercent()*0.3;

		if ((lower > 0 && body / lower <= maxBody && body / lower > minBody)
			&& (tradingDay.low > 0 && height / tradingDay.low >= minWick)
			&& Math.abs(midHeight - midBody) < 0.12*height
			&& height >= 3*body)
			return true;

		return false;
	}

	dataSeries.forEach((day, idx) => {
		if (isSpinningTop(day)) {
			const confirmation  = common.computeContinuousTrend(dataSeries,
				patternMap.spinningTop.preTrend,
				patternMap.spinningTop.confirm,
				idx,
				idx);
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