using System;
using System.Collections.Generic;
using AlertService.Services.Models;
using AlertService.Services.Models.Indicator;

namespace AlertService.Services.Common
{
	public class CandlePatterns
	{
		private static decimal getSign(OHLCV candle)
		{
			return candle.Close - candle.Open;
		}
		private static decimal getUpperBody(OHLCV candle)
		{
			return getSign(candle) > 0 ? candle.Close : candle.Open;
		}
		private static decimal getLowerBody(OHLCV candle)
		{
			return getSign(candle) > 0 ? candle.Open : candle.Close;
		}
		private static decimal getUpperWick(OHLCV candle)
		{
			return candle.High - getUpperBody(candle);
		}
		private static decimal getLowerWick(OHLCV candle)
		{
			return getLowerBody(candle) - candle.Low;
		}
		private static decimal getLargeBodyPercent()
		{
			return 0.04M;
		}
		private static bool isFollowTrend(OHLCV leftCandle, OHLCV rightCandle, int trend)
		{
			return (rightCandle.Close - leftCandle.Close) * trend >= 0;
		}
		public static bool IsMatchTrend(List<OHLCV> dataSeries, int window, int expectedTrend, int leftMostCandlePatternIdx)
		{
			var preTrendFollow = false;
			var leftIdx = leftMostCandlePatternIdx - window;
			if (leftIdx < 0
				|| !isFollowTrend(dataSeries[leftIdx], dataSeries[leftMostCandlePatternIdx], expectedTrend))
			{
				return preTrendFollow;
			}
			preTrendFollow = true;
			return preTrendFollow;
		}

		public static bool IsBullishCounterAttackCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) >= 0) return false;
			if (getSign(tradingDay2) <= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.5M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& Math.Abs(body1 - body2) / Math.Max(body1, body2) < 0.25M
				&& (Math.Abs(lower1 - upper2) / Math.Min(lower1, upper2) < 0.002M))
				return true;
			return false;
		}

		public static bool IsBearishCounterAttackCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) <= 0) return false;
			if (getSign(tradingDay2) >= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.5M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& Math.Abs(body1 - body2) / Math.Max(body1, body2) < 0.25M
				&& (Math.Abs(upper1 - lower2) / Math.Min(upper1, lower2) < 0.002M))
				return true;
			return false;
		}

		public static bool IsDarkCloudCoverCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) <= 0) return false;
			if (getSign(tradingDay2) >= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.6M;
			if (((lower1 > 0M && body1 / lower1 >= minBody)
					|| (lower2 > 0M && body2 / lower2 >= minBody))
				&& upper2 - upper1 >= 0.1M * body2
				&& lower2 < (upper1 + lower1) / 2M
				&& lower2 > lower1 + 0.1M * body1)
				return true;
			return false;
		}

		public static bool IsBullishEngulfingCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (tradingDay1.Close >= tradingDay1.Open) return false;
			if (tradingDay2.Close <= tradingDay2.Open) return false;
			if (tradingDay1.Open >= tradingDay2.Close
				|| tradingDay1.Close <= tradingDay2.Open)
				return false;
			var lower2 = getLowerBody(tradingDay2);
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var minBody = getLargeBodyPercent() * 0.6M;
			if (body2 / body1 > 1.3M
				&& (lower2 > 0M && body2 / lower2 > minBody))
				return true;
			return false;
		}

		public static bool IsBearishEngulfingCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (tradingDay1.Close <= tradingDay1.Open) return false;
			if (tradingDay2.Close >= tradingDay2.Open) return false;
			if (tradingDay1.Close >= tradingDay2.Open
				|| tradingDay1.Open <= tradingDay2.Close)
				return false;
			var lower2 = getLowerBody(tradingDay2);
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var minBody = getLargeBodyPercent() * 0.6M;
			if (body2 / body1 > 1.3M
				&& (lower2 > 0M && body2 / lower2 > minBody))
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
			var lower1 = getLowerBody(tradingDay1);
			var lower3 = getLowerBody(tradingDay3);
			var minBody = getLargeBodyPercent() * 0.5M;
			if (body2 / body1 < 0.2M
				&& body2 / body3 < 0.2M
				&& body1 / lower1 >= minBody
				&& body3 / lower3 >= minBody)
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
			var minBody = getLargeBodyPercent() * 0.05M;
			var minWick = getLargeBodyPercent() * 0.5M;
			if (height == 0)
				return false;
			if ((lower > 0 && body / lower >= minBody) &&
				body / height > 0.1M &&
				upperWick / height < 0.05M &&
				lowerWick >= 2M * body &&
				(tradingDay.Low > 0M && height / tradingDay.Low >= minWick))
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
			var minBody = getLargeBodyPercent() * 0.05M;
			var minWick = getLargeBodyPercent() * 0.5M;
			if (height == 0)
				return false;
			if ((lower > 0 && body / lower > minBody) &&
				body / height > 0.1M &&
				lowerWick / height < 0.05M &&
				upperWick >= 2M * body &&
				(tradingDay.Low > 0M && height / tradingDay.Low >= minWick))
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
			var lower1 = getLowerBody(tradingDay1);
			var lower3 = getLowerBody(tradingDay3);
			var minBody = getLargeBodyPercent() * 0.5M;
			if (body2 / body1 < 0.2M
				&& body2 / body3 < 0.2M
				&& body1 / lower1 >= minBody
				&& body3 / lower3 >= minBody)
				return true;
			return false;
		}

		public static bool IsBullishHaramiCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) >= 0) return false;
			if (getSign(tradingDay2) < 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.7M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& body2 < 0.25M * body1
				&& upper2 < upper1 - body1 * 0.1M
				&& lower2 > lower1 + body1 * 0.1M)
				return true;
			return false;
		}

		public static bool IsBearishHaramiCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) <= 0) return false;
			if (getSign(tradingDay2) > 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.7M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& body2 < 0.25M * body1
				&& upper2 < upper1 - body1 * 0.1M
				&& lower2 > lower1 + body1 * 0.1M)
				return true;
			return false;
		}

		public static bool IsWhiteMarubozu(OHLCV tradingDay)
		{
			if (getSign(tradingDay) <= 0)
				return false;
			var upperWick = getUpperWick(tradingDay);
			var lowerWick = getLowerWick(tradingDay);
			var upper = getUpperBody(tradingDay);
			var lower = getLowerBody(tradingDay);
			var body = upper - lower;
			if (lower > 0
				&& upperWick / lower < 0.0001M
				&& lowerWick / lower < 0.0001M
				&& body / lower >= getLargeBodyPercent())
				return true;

			return false;
		}

		public static bool IsBlackMarubozu(OHLCV tradingDay)
		{
			if (getSign(tradingDay) >= 0)
				return false;
			var upperWick = getUpperWick(tradingDay);
			var lowerWick = getLowerWick(tradingDay);
			var upper = getUpperBody(tradingDay);
			var lower = getLowerBody(tradingDay);
			var body = upper - lower;
			if (lower > 0
				&& upperWick / lower < 0.0001M
				&& lowerWick / lower < 0.0001M
				&& body / lower >= getLargeBodyPercent())
				return true;

			return false;
		}

		public static bool IsOnNeckCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) >= 0) return false;
			if (getSign(tradingDay2) <= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.6M;
			var smallBodyMin = getLargeBodyPercent() * 0.1M;
			var smallBodyMax = getLargeBodyPercent() * 0.25M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& (lower2 > 0 && body2 / lower2 >= smallBodyMin && body2 / lower2 <= smallBodyMax)
				&& (Math.Abs(lower1 - upper2) / Math.Min(lower1, upper2) < 0.002M))
				return true;
			return false;
		}

		public static bool IsPiercingCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) >= 0) return false;
			if (getSign(tradingDay2) <= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.6M;
			if (((lower1 > 0 && body1 / lower1 >= minBody)
					|| (lower2 > 0 && body2 / lower2 >= minBody))
				&& lower1 - lower2 >= 0.15M * body2
				&& upper2 > (upper1 + lower1) / 2M
				&& upper2 < lower1 + 0.8M * body1
				&& body1 > 0
				&& Math.Abs(body1 - body2) / body1 < 0.3M)
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
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var body3 = Math.Abs(tradingDay3.Close - tradingDay3.Open);
			var lower1 = getLowerBody(tradingDay1);
			var lower2 = getLowerBody(tradingDay2);
			var lower3 = getLowerBody(tradingDay3);
			var minBody = getLargeBodyPercent() * 0.4M;
			if (((tradingDay1.Open + tradingDay1.Close) / 2M >= tradingDay2.Open
				&& tradingDay1.Close <= tradingDay2.Open
				&& tradingDay1.Close > tradingDay2.Close
				&& lowerWick2 / body2 < 0.5M)
				&& ((tradingDay2.Open + tradingDay2.Close) / 2M >= tradingDay3.Open
					&& tradingDay2.Close <= tradingDay3.Open
					&& tradingDay2.Close > tradingDay3.Close
					&& lowerWick3 / body3 < 0.5M)
				&& body1 / lower1 > minBody
				&& body2 / lower2 > minBody
				&& body3 / lower3 > minBody)
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
			var body1 = Math.Abs(tradingDay1.Close - tradingDay1.Open);
			var body2 = Math.Abs(tradingDay2.Close - tradingDay2.Open);
			var body3 = Math.Abs(tradingDay3.Close - tradingDay3.Open);
			var lower1 = getLowerBody(tradingDay1);
			var lower2 = getLowerBody(tradingDay2);
			var lower3 = getLowerBody(tradingDay3);
			var minBody = getLargeBodyPercent() * 0.4M;
			if (((tradingDay1.Open + tradingDay1.Close) / 2M <= tradingDay2.Open
				&& tradingDay1.Close >= tradingDay2.Open
				&& tradingDay1.Close < tradingDay2.Close
				&& upperWick2 / body2 < 0.5M)
				&& ((tradingDay2.Open + tradingDay2.Close) / 2M <= tradingDay3.Open
					&& tradingDay2.Close >= tradingDay3.Open
					&& tradingDay2.Close < tradingDay3.Close
					&& upperWick3 / body3 < 0.5M)
				&& body1 / lower1 > minBody
				&& body2 / lower2 > minBody
				&& body3 / lower3 > minBody)
				return true;
			return false;
		}

		public static bool IsTweezerTopCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) <= 0) return false;
			if (getSign(tradingDay2) >= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.6M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& (lower2 > 0 && body2 / lower2 >= minBody)
				&& Math.Abs(body1 - body2) / Math.Max(body1, body2) < 0.3M
				&& (Math.Abs(tradingDay1.High - tradingDay2.High) / Math.Min(tradingDay1.High, tradingDay2.High) < 0.008M
					|| (Math.Abs(upper1 - upper2) / Math.Min(upper1, upper2) < 0.008M)))
				return true;
			return false;
		}

		public static bool IsTweezerBottomCandles(OHLCV tradingDay1, OHLCV tradingDay2)
		{
			if (getSign(tradingDay1) >= 0) return false;
			if (getSign(tradingDay2) <= 0) return false;
			var upper1 = getUpperBody(tradingDay1);
			var lower1 = getLowerBody(tradingDay1);
			var upper2 = getUpperBody(tradingDay2);
			var lower2 = getLowerBody(tradingDay2);
			var body1 = upper1 - lower1;
			var body2 = upper2 - lower2;
			var minBody = getLargeBodyPercent() * 0.6M;
			if ((lower1 > 0 && body1 / lower1 >= minBody)
				&& (lower2 > 0 && body2 / lower2 >= minBody)
				&& Math.Abs(body1 - body2) / Math.Max(body1, body2) < 0.3M
				&& (Math.Abs(tradingDay1.Low - tradingDay2.Low) / Math.Min(tradingDay1.Low, tradingDay2.Low) < 0.008M
					|| (Math.Abs(lower1 - lower2) / Math.Min(lower1, lower2) < 0.008M)))
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
					|| (smaInd.Points[i - 1].Value < maxPeakDip * cwh.RightHigh.Value))
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