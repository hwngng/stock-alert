using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Hubs;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public abstract class BaseCandleAlert : BaseAlert
	{
		public BaseCandleAlert(IConfiguration config,
								ILogger<DataProvider> logger,
								IDataProvider dataProvider,
								AlertPublisher alertPublisher,
								IDistributedCache cache) : base(config, logger, dataProvider, alertPublisher, cache)
		{
		}

		public override abstract Task<List<Alert>> ProcessMessage(SocketMessage msg);
	}
}