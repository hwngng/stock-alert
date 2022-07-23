const common = {
	getSign(candle) {
		return candle.close - candle.open;
	},
	getUpperBody(candle) {
		return this.getSign(candle) > 0 ? candle.close : candle.open;
	},
	getLowerBody(candle) {
		return this.getSign(candle) > 0 ? candle.open : candle.close;
	},
	getUpperWick(candle) {
		return candle.high - this.getUpperBody(candle);
	},
	getLowerWick(candle) {
		return this.getLowerBody(candle) - candle.low;
	},
	getLargeBodyPercent() {
		return 0.04;
	},
	isFollowTrend(leftCandle, rightCandle, trend) {
		return (rightCandle.close - leftCandle.close) * trend >= 0;
	},
	computeMatchTrend(dataSeries, preTrend, confirm, leftMostCandlePatternIdx, rightMostCandlePatternIdx) {
		let preTrendFollow = false;
		let confirmation = null;
		if (preTrend) {
			let leftIdx = leftMostCandlePatternIdx - preTrend.window;
			if (leftIdx < 0
				|| !common.isFollowTrend(dataSeries[leftIdx], dataSeries[leftMostCandlePatternIdx], preTrend.trend)) {
				return { preTrendFollow, confirmation };
			}
		}
		preTrendFollow = true;
		let rightIdx = rightMostCandlePatternIdx + confirm.window;
		if (rightIdx < dataSeries.length) {
			confirmation = common.isFollowTrend(dataSeries[rightMostCandlePatternIdx], dataSeries[rightIdx], confirm.trend);
		}
		return { preTrendFollow, confirmation }
	},
	computeContinuousTrend(dataSeries, preTrend, confirm, leftMostCandlePatternIdx, rightMostCandlePatternIdx) {
		let confirmation = null;
		let leftIdx = leftMostCandlePatternIdx - preTrend.window;
		if (leftIdx < 0) {
			return confirmation;
		}
		let rightIdx = rightMostCandlePatternIdx + confirm.window;
		if (rightIdx < dataSeries.length) {
			confirmation = ((dataSeries[leftMostCandlePatternIdx].close - dataSeries[leftIdx].close)
							* (dataSeries[rightIdx].close - dataSeries[rightMostCandlePatternIdx].close)) > 0;
		}
		return confirmation
	}
}

export default common;