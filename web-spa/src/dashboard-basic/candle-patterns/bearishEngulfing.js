export default function bearishEngulfing(dataSeries) {
	const resultPatterns = [];
	const isBearishEngulfingCandles = function(tradingDay1, tradingDay2) {
		if (tradingDay1.close <= tradingDay1.open) return false;
		if (tradingDay2.close >= tradingDay2.open) return false;
		if (tradingDay1.close >= tradingDay2.open
			|| tradingDay1.open <= tradingDay2.close)
			return false;
		let body1 = Math.abs(tradingDay1.close - tradingDay1.open);
		let body2 = Math.abs(tradingDay2.close - tradingDay2.open);
		if (body2 / body1 > 1.3)
			return true;
		return false;
	}

	if (dataSeries.length >= 2) {
		for (let i = 1; i < dataSeries.length; ++i) {
			if (isBearishEngulfingCandles(dataSeries[i-1], dataSeries[i])) {
				resultPatterns.push([dataSeries[i-1], dataSeries[i]]);
				i += 2;
			}
		}
	}
	return resultPatterns;
}

