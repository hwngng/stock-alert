using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public class BasicCandle : BaseCandleAlert
	{
		public BasicCandle(IConfiguration config, ILogger<DataProvider> logger, IDataProvider dataHub) : base(config, logger, dataHub)
		{
		}

		public override Task ProcessMessage(SocketMessage msg)
		{
			throw new NotImplementedException();
		}

		protected override void PrepareData(List<string> codes, DateTime startFrom, DateTime? toDate = null)
		{
			throw new NotImplementedException();
		}
	}
}