using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Interfaces;
using AlertService.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Impls
{
	public class BasicCandle : BaseCandleAlert
	{
		public BasicCandle(IConfiguration config, ILogger<DataHub> logger, IDataHub dataHub) : base(config, logger, dataHub)
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