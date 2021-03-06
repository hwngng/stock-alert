import common from "./common";
import patternMap from "../../common/patternMap";

export function bullishEngulfing(dataSeries) {
	const resultPatterns = [];
	const isBullishEngulfingCandles = function (tradingDay1, tradingDay2) {
		if (tradingDay1.close >= tradingDay1.open) return false;
		if (tradingDay2.close <= tradingDay2.open) return false;
		if (tradingDay1.open >= tradingDay2.close
			|| tradingDay1.close <= tradingDay2.open)
			return false;
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = Math.abs(tradingDay1.close - tradingDay1.open);
		let body2 = Math.abs(tradingDay2.close - tradingDay2.open);
		let minBody = common.getLargeBodyPercent() * 0.6;
		if (body2 / body1 > 1.3
			&& (lower2 > 0 && body2 / lower2 > minBody))
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isBullishEngulfingCandles(dataSeries[i - 1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.bullishEngulfing.preTrend,
					patternMap.bullishEngulfing.confirm,
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

export function bearishEngulfing(dataSeries) {
	const resultPatterns = [];
	const isBearishEngulfingCandles = function (tradingDay1, tradingDay2) {
		if (tradingDay1.close <= tradingDay1.open) return false;
		if (tradingDay2.close >= tradingDay2.open) return false;
		if (tradingDay1.close >= tradingDay2.open
			|| tradingDay1.open <= tradingDay2.close)
			return false;
		let lower2 = common.getLowerBody(tradingDay2);
		let body1 = Math.abs(tradingDay1.close - tradingDay1.open);
		let body2 = Math.abs(tradingDay2.close - tradingDay2.open);
		let minBody = common.getLargeBodyPercent() * 0.6;
		if (body2 / body1 > 1.3
			&& (lower2 > 0 && body2 / lower2 > minBody))
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isBearishEngulfingCandles(dataSeries[i - 1], dataSeries[i])) {
				const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
					patternMap.bearishEngulfing.preTrend,
					patternMap.bearishEngulfing.confirm,
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

