import patternMap from "../../common/patternMap";
import common from "./common";

export default function eveningStar(dataSeries) {
	const resultPatterns = [];
	const isEveningStarCandles = function (tradingDay1, tradingDay2, tradingDay3) {
		if (tradingDay1.close <= tradingDay1.open) return false;
		if (tradingDay3.close >= tradingDay3.open) return false;
		if (tradingDay2.open < tradingDay1.close
			|| tradingDay2.close < tradingDay1.close)
			return false;
		if (tradingDay2.open < tradingDay3.open
			|| tradingDay2.close < tradingDay3.open)
			return false;
		let body1 = Math.abs(tradingDay1.close - tradingDay1.open);
		let body2 = Math.abs(tradingDay2.close - tradingDay2.open);
		let body3 = Math.abs(tradingDay3.close - tradingDay3.open);
		let lower1 = common.getLowerBody(tradingDay1);
		let lower3 = common.getLowerBody(tradingDay3);
		let minBody = common.getLargeBodyPercent() * 0.5;
		if (body2 / body1 < 0.2
			&& body2 / body3 < 0.2
			&& body1 / lower1 >= minBody
			&& body3 / lower3 >= minBody)
			return true;
		return false;
	}

	if (dataSeries.length >= 3) {
		for (let i = 2; i < dataSeries.length; ++i) {
			if (isEveningStarCandles(dataSeries[i - 2], dataSeries[i - 1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.eveningStar.preTrend,
					patternMap.eveningStar.confirm,
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

