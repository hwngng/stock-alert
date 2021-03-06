import patternMap from "../../common/patternMap";
import common from "./common";

export default function threeWhiteSoldiers(dataSeries) {
	const resultPatterns = [];
	const isThreeWhiteSoldiersCandles = function(tradingDay1, tradingDay2, tradingDay3) {
		if (tradingDay1.close <= tradingDay1.open) return false;
		if (tradingDay2.close <= tradingDay2.open) return false;
		if (tradingDay3.close <= tradingDay3.open) return false;
		let upperWick2 = tradingDay2.high - tradingDay2.close;
		let upperWick3 = tradingDay3.high - tradingDay3.close;
		let body2 = Math.abs(tradingDay2.close - tradingDay2.open);
		let body3 = Math.abs(tradingDay3.close - tradingDay3.open);
		if (((tradingDay1.open + tradingDay1.close)/2 <= tradingDay2.open
				&& tradingDay1.close >= tradingDay2.open
				&& tradingDay1.close < tradingDay2.close
				&& upperWick2 / body2 < 0.5)
			&& ((tradingDay2.open + tradingDay2.close)/2 <= tradingDay3.open
				&& tradingDay2.close >= tradingDay3.open
				&& tradingDay2.close < tradingDay3.close
				&& upperWick3 / body3 < 0.5))
			return true;
		return false;
	}

	if (dataSeries.length >= 3) {
		for (let i = 2; i < dataSeries.length; ++i) {
			if (isThreeWhiteSoldiersCandles(dataSeries[i-2], dataSeries[i-1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.threeWhiteSoldiers.preTrend,
					patternMap.threeWhiteSoldiers.confirm,
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

