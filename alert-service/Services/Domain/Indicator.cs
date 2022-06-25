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
            for(var i = offset + period - 1; i < ohlcs.Count; ++i)
            {
                var pp = new PricePoint();
                pp.Date = ohlcs[i].Date;
                pp.Value = ohlcs.GetRange(i - period + 1, period).Select(x => x.Close).Average();
                sma.Points.Add(pp);
            }

            return sma;
        }
    }
}