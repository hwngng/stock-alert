using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AlertService.Services.Interfaces;
using AlertService.Services.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AlertService.Services.Impls
{
	public abstract class BaseCandleAlert : IHandleMessage
	{
        private readonly IConfiguration _config;
        private readonly ILogger<DataProvider> _logger;
        private readonly IDataProvider _dataHub;
        private readonly Dictionary<string, Stock> _data;
        private readonly Dictionary<string, Message>  _lastScanPrice;

        public BaseCandleAlert (IConfiguration config, ILogger<DataProvider> logger, IDataProvider dataHub) {
            _config = config;
            _logger = logger;
            _dataHub = dataHub;
            _data = new Dictionary<string, Stock>();
            _lastScanPrice = new Dictionary<string, Message>();
        }

        protected abstract void PrepareData (List<string> codes, DateTime startFrom, DateTime? toDate = null);

		public abstract Task ProcessMessage(SocketMessage msg);
	}
}