using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AlertService.Services.Common;
using AlertService.Services.Domain;
using AlertService.Services.Impls;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using CsvHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AlertService.Controllers
{
	[ApiController]
	[Route("api")]
	public class FilterController : BaseController
	{
		private readonly IDataProvider _dataProvider;
		private readonly ComplexCandle _complexCandle;
		public FilterController(IDataProvider dataProvider, ILogger<FilterController> logger, ComplexCandle complexCandle) : base(logger)
		{
			_dataProvider = dataProvider;
			_complexCandle = complexCandle;
		}

		[HttpGet]
		[Route("cwh")]
		public async Task<IActionResult> GetCwH(string path = null, string code = null, DateTime? from = null, DateTime? to = null)
		{
			try
			{
				if (!string.IsNullOrEmpty(path))
				{
					var sr = new StreamReader(path);
					using (var csv = new CsvReader(sr, CultureInfo.InvariantCulture))
					{
						var records = csv.GetRecords<dynamic>();
						var ohlcs = records.Select(x => new OHLCV
						{
							Date = DateTime.SpecifyKind(DateTime.Parse(x.dt), DateTimeKind.Utc),
							Open = decimal.Parse(x.open),
							High = decimal.Parse(x.high),
							Low = decimal.Parse(x.low),
							Close = decimal.Parse(x.close)
						}).ToList();
						var cwhs = _complexCandle.GetAllCupWithHandle(new Stock { HistoricalPrice = ohlcs }, null);
						return Ok(cwhs);
					}
				}
				else if (!string.IsNullOrEmpty(code))
				{
					var ohlcs = await _dataProvider.GetHistoricalPrice(code, from.HasValue ? from.Value : new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc),
																		to.HasValue ? to : DateTime.UtcNow);
					var stopwatch = new System.Diagnostics.Stopwatch();
					stopwatch.Start();
					var cwhs = _complexCandle.GetAllCupWithHandle(new Stock { HistoricalPrice = ohlcs }, null, 20000);
					stopwatch.Stop();
					System.Console.WriteLine(stopwatch.ElapsedMilliseconds);
					return Ok(cwhs);
				}
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error ");
			}

			return NoContent();
		}
	}
}