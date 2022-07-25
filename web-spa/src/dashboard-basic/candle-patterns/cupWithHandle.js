import common from "./common";
import patternMap from "../../common/patternMap";
import Helper from "../../common/helper";

const getNearestCupWithHandle = function (dataSeries, traceFrom = -1) {
	const fluc = 0.1;
	const cupDepthRightMax = 0.4;
	const cupDepthRightMin = 0.15;
	const cupDepthLeftMax = 0.45;
	const cupDepthLeftMin = 0.18;
	const highDiff = 0.1;
	const handleDepth = 0.15;
	const maxPeakDip = 0.85;

	let cwh = {};

	let n = dataSeries.length;
	let i = (traceFrom > 0 && traceFrom < dataSeries.length) ? traceFrom : dataSeries.length - 1;
	let rh = i;
	// trace right high point
	while (i > 0
		&& ((dataSeries[i - 1].close >= dataSeries[i].close)
			|| (dataSeries[i - 1].close < dataSeries[i].close
				&& dataSeries[i - 1].close >= (1 - fluc) * dataSeries[rh].close))
	) {
		if (dataSeries[i - 1].close >= dataSeries[rh].close)
			rh = i - 1;
		--i;
	}
	if (i <= 0 || rh == traceFrom)
		return null;

	cwh.rightHigh = dataSeries[rh];
	cwh.rhIndex = rh;

	// extend low handle
	let j = rh;
	let lowright = rh;
	while (j < n - 1
		&& ((dataSeries[j + 1].close <= dataSeries[j].close)
			|| (dataSeries[j + 1].close > dataSeries[j].close
				&& dataSeries[j + 1].close <= (1 + fluc) * dataSeries[lowright].close))
	) {
		if (dataSeries[j + 1].close <= dataSeries[lowright].close)
			lowright = j + 1;
		++j;
	}
	cwh.lowHandle = dataSeries[lowright];
	cwh.lowHandleIndex = lowright;

	// validate handle depth, deepest is 15% from right high
	if (cwh.rightHigh.close - cwh.lowHandle.close > handleDepth * cwh.rightHigh.close
		|| cwh.rightHigh.close - cwh.lowHandle.close <= 0)
		return null;
	// trace dip point
	let dip = i;
	while (i > 0
		&& ((dataSeries[i - 1].close <= dataSeries[i].close)
			|| (dataSeries[i - 1].close > dataSeries[i].close
				&& dataSeries[i - 1].close <= (1 + fluc) * dataSeries[dip].close)
			|| (dataSeries[i - 1].close < maxPeakDip * cwh.rightHigh.close))
	) {
		if (dataSeries[i - 1].close <= dataSeries[dip].close)
			dip = i - 1;
		--i;
	}
	if (i <= 0)
		return null;

	cwh.dip = dataSeries[dip];
	cwh.dipIndex = dip;

	// validate dip price
	let dipChange = cwh.rightHigh.close - cwh.dip.close;
	if (dipChange < cupDepthRightMin * cwh.rightHigh.close
		|| dipChange > cupDepthRightMax * cwh.rightHigh.close)
		return null;

	let lh = i;
	// trace left high point
	while (i > 0
		&& ((dataSeries[i - 1].close >= dataSeries[i].close)
			|| (dataSeries[i - 1].close < dataSeries[i].close
				&& dataSeries[i - 1].close >= (1 - fluc) * dataSeries[lh].close))
	) {
		if (dataSeries[i - 1].close >= dataSeries[lh].close)
			lh = i - 1;
		--i;
	}

	cwh.leftHigh = dataSeries[lh];
	cwh.lhIndex = lh;

	// validate dip price
	dipChange = cwh.leftHigh.close - cwh.dip.close;
	if (dipChange < cupDepthLeftMin * cwh.leftHigh.close
		|| dipChange > cupDepthLeftMax * cwh.leftHigh.close)
		return null;
	// validate left right high duration
	let cupWidth = rh - lh;
	if (cupWidth < 5 * 5 || cupWidth > 26 * 5)
		return null;
	// validate left right high price
	if (Math.abs(cwh.rightHigh.close - cwh.leftHigh.close) > highDiff * cwh.rightHigh.close)
		return null;

	return cwh;
}

export function cupWithHandle(dataSeries) {
	const resultPatterns = [];
	const cwhs = [];

	for (let i = dataSeries.length - 1; i > 5 * 5; --i)		// 8 week
	{
		let cwh = getNearestCupWithHandle(dataSeries, i);
		if (!cwh)
			continue;
		cwhs.push(cwh);
		let candles = dataSeries.slice(cwh.lhIndex, cwh.lowHandleIndex + 1);
		const { preTrendFollow, confirmation } = common.computeMatchTrend(dataSeries,
			patternMap.cupWithHandle.preTrend,
			patternMap.cupWithHandle.confirm,
			i - 1,
			i);
		let medCandle = Helper.getMedium(candles, 0, candles.length - 1);
		resultPatterns.unshift({
			confirmation: confirmation,
			annotation: {
				date: medCandle?.date
			},
			candles: candles
		});
		i = cwh.dipIndex;
	}

	return resultPatterns;
}

