using System;
using System.Collections.Generic;
using System.Linq;
using AlertService.Services.Models;
using AlertService.Services.Models.Indicator;

namespace AlertService.Services.Domain
{
	public class Indicator
	{
		public static SMA GetSMA(List<OHLCV> ohlcs, int period, int offset = 0)
		{
			var sma = new SMA(period);
			sma.Points = new List<PricePoint>();
			if (offset + period - 1 >= ohlcs.Count)
			{
				return sma;
			}
			var sumPeriod = ohlcs.GetRange(offset, period).Select(x => x.Close).Sum();
			var pp = new PricePoint();
			pp.Date = ohlcs[offset + period - 1].Date;
			pp.Value = sumPeriod / period;
            sma.Points.Add(pp);

			for (var i = offset + period; i < ohlcs.Count; ++i)
			{
				pp = new PricePoint();
				pp.Date = ohlcs[i].Date;
                sumPeriod -= ohlcs[i - period].Close;
                sumPeriod += ohlcs[i].Close;
				pp.Value = sumPeriod / period;
				sma.Points.Add(pp);
			}

			return sma;
		}

        private static decimal calcRSI(decimal avgGain, decimal avgLoss)
        {
            if (avgGain < 0.000001M) {
                return 0;
            }

            if (avgLoss < 0.000001M) {
                return 100;
            }
            
            return 100.0M - (100.0M / (1 + (avgGain / avgLoss)));
        }

		public static RSI GetRSI(List<OHLCV> ohlcs, int period, int offset = 1)
		{
			var rsi = new RSI(period);
			rsi.Points = new List<PricePoint>();
			if (offset + period - 1 >= ohlcs.Count || offset < 1)
			{
				return rsi;
			}
            var sumGain = 0M;
            var sumLoss = 0M;
            for (var i = offset; i < offset + period; ++i)
            {
                var change = ohlcs[i].Close - ohlcs[i-1].Close;
                var gain = change > 0 ? change : 0; 
                var loss = change < 0 ? -change : 0; 
                sumGain +=  gain;
                sumLoss += loss;
            }
			var avgGain = sumGain / period;
            var avgLoss = sumLoss / period;
			var pp = new PricePoint();
			pp.Date = ohlcs[offset + period - 1].Date;
			pp.Value = calcRSI(avgGain, avgLoss);
            rsi.Points.Add(pp);
			for (var i = offset + period; i < ohlcs.Count; ++i)
			{
				pp = new PricePoint();
				pp.Date = ohlcs[i].Date;
                var change = ohlcs[i].Close - ohlcs[i-1].Close;
                var gain = change > 0 ? change : 0; 
                var loss = change < 0 ? -change : 0; 
                avgGain = (avgGain * 13 + gain) / 14;
                avgLoss = (avgLoss * 13 + loss) / 14;
				pp.Value = calcRSI(avgGain, avgLoss);
				rsi.Points.Add(pp);
			}

			return rsi;
		}
	}
}