using System.Collections.Generic;

namespace AlertService.Services.Settings
{
	public class WebSocketSettings
	{
		private int _pingInterval;
		private int _retryHandshake;
		private int _retryDelay;

		public string DataSourceApi { get; set; }
		public int PingInterval
		{
			get
			{
				if (_pingInterval > 0)
					return _pingInterval;
				return 25000;
			}
			set
			{
				_pingInterval = value;
			}
		}
		public List<string> SubStocks { get; set; }
		public List<string> ReservedMessageTypes { get; set; }
		public int RetryHandshake
		{
			get
			{
				if (_retryHandshake > 0)
					return _retryHandshake;
				return 3;
			}
			set
			{
				_retryHandshake = value;
			}
		}
		public int RetryDelay
		{
			get
			{
				if (_retryDelay > 0)
					return _retryDelay;
				return 1000;
			}
			set
			{
				_retryDelay = value;
			}
		}
	}
}