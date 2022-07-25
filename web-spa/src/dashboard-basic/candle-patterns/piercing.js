import common from "./common";
import patternMap from "../../common/patternMap";

export function piercing(dataSeries) {
	const resultPatterns = [];
	const isPiercingCandles = function(tradingDay1, tradingDay2) {
		if (common.getSign(tradingDay1) >= 0) return false;
		if (common.getSign(tradingDay2) <= 0) return false;
		let upper1 = common.getUpperBody(tradingDay1);
		let lower1 = common.getLowerBody(tradingDay1);
		let upper2 = common.getUpperBody(tradingDay2);
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = upper1 - lower1;
		let body2 = upper2 - lower2;
		let minBody = common.getLargeBodyPercent()*0.6;
		if (((lower1 > 0 && body1/lower1 >= minBody)
				|| (lower2 > 0 && body2/lower2 >= minBody))
			&& lower1 - lower2 >= 0.15*body2
			&& upper2 > (upper1 + lower1)/2
			&& upper2 < lower1 + 0.8*body1
			&& body1 > 0
			&& Math.abs(body1 - body2) / body1 < 0.3)
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isPiercingCandles(dataSeries[i-1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.piercing.preTrend,
					patternMap.piercing.confirm,
					i - 1,
					i);
				if (!preTrendFollow) {
					continue;
				}
				resultPatterns.push({
					confirmation: confirmation,
					annotation: {
						date: dataSeries[i - 1].date
					},
					candles: [dataSeries[i - 1], dataSeries[i]]
				});
				i += 2;
			}
		}
	}
	return resultPatterns;
}

