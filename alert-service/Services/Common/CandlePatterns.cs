using System;
using AlertService.Services.Models;
using AlertService.Services.Models.Indicator;

namespace AlertService.Services.Common
{
	public class CandlePatterns
	{
		public static bool IsBearishEngulfingCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (tradingDay1.Close <= tradingDay1.Open) return false;
			if (tradingDay2.Close >= tradingDay2.Open) return false;
			if (tradingDay1.Close > tradingDay2.Open
				|| tradingDay1.Open <= tradingDay2.Close)
				return false;
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			if (body2 / body1 > 1.3M)
				return true;
			return false;
		}

		public static bool IsBullishEngulfingCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (tradingDay1.Close >= tradingDay1.Open) return false;
			if (tradingDay2.Close <= tradingDay2.Open) return false;
			if (tradingDay1.Open >= tradingDay2.Close
				|| tradingDay1.Close < tradingDay2.Open)
				return false;
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			if (body2 / body1 > 1.3M)
				return true;
			return false;
		}

		public static bool IsEveningStarCandles(OHLCV tradingDay1, OHLCV tradingDay2, OHLCV tradingDay3)
		{
			if (tradingDay1.Close <= tradingDay1.Open) return false;
			if (tradingDay3.Close >= tradingDay3.Open) return false;
			if (tradingDay2.Open < tradingDay1.Close
				|| tradingDay2.Close < tradingDay1.Close)
				return false;
			if (tradingDay2.Open < tradingDay3.Open
				|| tradingDay2.Close < tradingDay3.Open)
				return false;
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var body3 = Math.Abs(tradingDay3.Close - tradingDay3.Open);
			if (body2 / body1 < 0.2M
				&& body2 / body3 < 0.2M)
				return true;
			return false;
		}

		public static bool IsHammerCandle(OHLCV tradingDay)
		{
			var upper = tradingDay.Close;
			var lower = tradingDay.Open;
			if (tradingDay.Close < tradingDay.Open)
			{
				upper = tradingDay.Open;
				lower = tradingDay.Close;
			}
			var upperWick = tradingDay.High - upper;
			var lowerWick = lower - tradingDay.Low;
			var body = upper - lower;
			var height = tradingDay.High - tradingDay.Low;
			if (height <= 0.001M)
				return false;
			if (body / height > 0.15M &&
				upperWick / height < 0.05M &&
				lowerWick >= 2M * body)
				return true;

			return false;
		}

		public static bool IsInvertedHammerCandle(OHLCV tradingDay)
		{
			var upper = tradingDay.Close;
			var lower = tradingDay.Open;
			if (tradingDay.Close < tradingDay.Open)
			{
				upper = tradingDay.Open;
				lower = tradingDay.Close;
			}
			var upperWick = tradingDay.High - upper;
			var lowerWick = lower - tradingDay.Low;
			var body = upper - lower;
			var height = tradingDay.High - tradingDay.Low;
			if (height <= 0.001M)
				return false;
			if (body / height > 0.1M &&
				lowerWick / height < 0.05M &&
				upperWick >= 2M * body)
				return true;

			return false;
		}

		public static bool IsMorningStarCandles(OHLCV tradingDay1, OHLCV tradingDay2, OHLCV tradingDay3)
		{
			if (tradingDay1.Close >= tradingDay1.Open) return false;
			if (tradingDay3.Close <= tradingDay3.Open) return false;
			if (tradingDay2.Open > tradingDay1.Close
				|| tradingDay2.Close > tradingDay1.Close)
				return false;
			if (tradingDay2.Open > tradingDay3.Open
				|| tradingDay2.Close > tradingDay3.Open)
				return false;
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var body3 = Math.Abs(tradingDay3.Close - tradingDay3.Open);
			if (body2 / body1 < 0.2M
				&& body2 / body3 < 0.2M)
				return true;
			return false;
		}

		public static bool IsThreeBlackCrowsCandles(OHLCV tradingDay1, OHLCV tradingDay2, OHLCV tradingDay3)
		{
			if (tradingDay1.Close >= tradingDay1.Open) return false;
			if (tradingDay2.Close >= tradingDay2.Open) return false;
			if (tradingDay3.Close >= tradingDay3.Open) return false;
			var lowerWick2 = tradingDay2.Close - tradingDay2.Low;
			var lowerWick3 = tradingDay3.Close - tradingDay2.Low;
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var body3 = Math.Abs(tradingDay3.Close - tradingDay3.Open);
			if (((tradingDay1.Open + tradingDay1.Close) / 2M >= tradingDay2.Open
					&& tradingDay1.Close <= tradingDay2.Open
					&& tradingDay1.Close > tradingDay2.Close
					&& lowerWick2 / body2 < 0.5M)
				&& ((tradingDay2.Open + tradingDay2.Close) / 2M >= tradingDay3.Open
					&& tradingDay2.Close <= tradingDay3.Open
					&& tradingDay2.Close > tradingDay3.Close
					&& lowerWick3 / body3 < 0.5M))
				return true;
			return false;
		}

		public static bool IsThreeWhiteSoldiersCandles(OHLCV tradingDay1, OHLCV tradingDay2, OHLCV tradingDay3)
		{
			if (tradingDay1.Close <= tradingDay1.Open) return false;
			if (tradingDay2.Close <= tradingDay2.Open) return false;
			if (tradingDay3.Close <= tradingDay3.Open) return false;
			var upperWick2 = tradingDay2.High - tradingDay2.Close;
			var upperWick3 = tradingDay3.High - tradingDay3.Close;
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var body3 = Math.Abs(tradingDay3.Close - tradingDay3.Open);
			if (((tradingDay1.Open + tradingDay1.Close) / 2M <= tradingDay2.Open
					&& tradingDay1.Close >= tradingDay2.Open
					&& tradingDay1.Close < tradingDay2.Close
					&& upperWick2 / body2 < 0.5M)
				&& ((tradingDay2.Open + tradingDay2.Close) / 2M <= tradingDay3.Open
					&& tradingDay2.Close >= tradingDay3.Open
					&& tradingDay2.Close < tradingDay3.Close
					&& upperWick3 / body3 < 0.5M))
				return true;
			return false;
		}

		// ref: https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.118.659&rep=rep1&type=pdf 
		// 		page 7
		public static CupWithHandle GetNearestCupWithHandle(SMA smaInd, int traceFrom = -1)
		{
			const decimal fluc = 0.1M;
			const decimal cupDepthRightMax = 0.4M;
			const decimal cupDepthRightMin = 0.15M;
			const decimal cupDepthLeftMax = 0.45M;
			const decimal cupDepthLeftMin = 0.18M;
			const decimal highDiff = 0.1M;
			const decimal handleDepth = 0.15M;
			const decimal maxPeakDip = 0.85M;

			var cwh = new CupWithHandle();

			var n = smaInd.Points.Count;
			var i = (traceFrom > 0 && traceFrom < smaInd.Points.Count) ? traceFrom : smaInd.Points.Count - 1;
			var rh = i;
			// trace right high point
			while (i > 0
				&& ((smaInd.Points[i - 1].Value >= smaInd.Points[i].Value)
					|| (smaInd.Points[i - 1].Value < smaInd.Points[i].Value
						&& smaInd.Points[i - 1].Value >= (1 - fluc) * smaInd.Points[rh].Value))
			)
			{
				if (smaInd.Points[i - 1].Value >= smaInd.Points[rh].Value)
					rh = i - 1;
				--i;
			}
			if (i <= 0 || rh == traceFrom)
				return null;

			cwh.RightHigh = smaInd.Points[rh];

			// extend low handle
			var j = rh;
			var lowright = rh;
			while (j < n - 1
				&& ((smaInd.Points[j + 1].Value <= smaInd.Points[j].Value)
					|| (smaInd.Points[j + 1].Value > smaInd.Points[j].Value
						&& smaInd.Points[j + 1].Value <= (1 + fluc) * smaInd.Points[lowright].Value))
						)
			{
				if (smaInd.Points[j + 1].Value <= smaInd.Points[lowright].Value)
					lowright = j + 1;
				++j;
			}
			cwh.LowHandle = smaInd.Points[lowright];
			// rh = rh;
			// validate handle depth, deepest is 15% from right high
			if (cwh.RightHigh.Value - cwh.LowHandle.Value > handleDepth * cwh.RightHigh.Value
				|| cwh.RightHigh.Value - cwh.LowHandle.Value <= 0)
				return null;
			// trace dip point
			var dip = i;
			while (i > 0
				&& ((smaInd.Points[i - 1].Value <= smaInd.Points[i].Value)
					|| (smaInd.Points[i - 1].Value > smaInd.Points[i].Value
						&& smaInd.Points[i - 1].Value <= (1 + fluc) * smaInd.Points[dip].Value)
					|| (smaInd.Points[i-1].Value < maxPeakDip*cwh.RightHigh.Value))
			)
			{
				if (smaInd.Points[i - 1].Value <= smaInd.Points[dip].Value)
					dip = i - 1;
				--i;
			}
			if (i <= 0)
				return null;

			cwh.Dip = smaInd.Points[dip];
			cwh.DipIndex = dip;
			// dip = i;

			// validate dip duration
			// var rightSlopeDuration = rh - dip;
			// if (rightSlopeDuration < 1.5 * 5 || rightSlopeDuration > 6 * 5)     // 1 week = 5 trading days
			// 	return null;
			// validate dip price
			var dipChange = cwh.RightHigh.Value - cwh.Dip.Value;
			if (dipChange < cupDepthRightMin * cwh.RightHigh.Value
				|| dipChange > cupDepthRightMax * cwh.RightHigh.Value)
				return null;

			var lh = i;
			// trace left high point
			while (i > 0
				&& ((smaInd.Points[i - 1].Value >= smaInd.Points[i].Value)
					|| (smaInd.Points[i - 1].Value < smaInd.Points[i].Value
						&& smaInd.Points[i - 1].Value >= (1 - fluc) * smaInd.Points[lh].Value))
			)
			{
				if (smaInd.Points[i - 1].Value >= smaInd.Points[lh].Value)
					lh = i - 1;
				--i;
			}

			cwh.LeftHigh = smaInd.Points[lh];
			// validate dip price
			dipChange = cwh.LeftHigh.Value - cwh.Dip.Value;
			if (dipChange < cupDepthLeftMin * cwh.LeftHigh.Value
				|| dipChange > cupDepthLeftMax * cwh.LeftHigh.Value)
				return null;
			// validate left right high duration
			var cupWidth = rh - lh;
			if (cupWidth < 5 * 5 || cupWidth > 26 * 5)
				return null;
			// validate left right high price
			if (Math.Abs(cwh.RightHigh.Value - cwh.LeftHigh.Value) > highDiff * cwh.RightHigh.Value)
				return null;

			return cwh;
		}
	}
}