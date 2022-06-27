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
	}
}

export default common;