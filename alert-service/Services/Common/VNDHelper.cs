using System;
using System.Collections.Generic;
using System.Reflection;
using AlertService.Services.Models;

namespace AlertService.Services.Common
{
	public static class VNDHelper
	{
		private static Dictionary<string, Dictionary<string, List<string>>> _fieldLocator;
		private static Dictionary<string, Dictionary<string, Dictionary<string, int>>> _fieldLocatorDict;
		private static string _fieldSeparator;

		public static Dictionary<T, int> FlipIndexValueList<T>(List<T> target)
		{
			var result = new Dictionary<T, int>();
			for (var i = 0; i < target.Count; ++i)
			{
				result.Add(target[i], i);
			}
			return result;
		}

		static VNDHelper()
		{
			_fieldLocator = new Dictionary<string, Dictionary<string, List<string>>>();
			_fieldLocatorDict = new Dictionary<string, Dictionary<string, Dictionary<string, int>>>();

			_fieldLocator["SFU"] = new Dictionary<string, List<string>>();
			_fieldLocatorDict["SFU"] = new Dictionary<string, Dictionary<string, int>>();
			_fieldLocator["SFU"]["ST"] = new List<string> {
				"Symbol",
				"StockType",
				"ExchangeCode",
				"RefPrice",
				"FloorPrice",
				"CeilingPrice",
				"BidPrice01",
				"BidPrice02",
				"BidPrice03",
				"BidPrice04",
				"BidPrice05",
				"BidPrice06",
				"BidPrice07",
				"BidPrice08",
				"BidPrice09",
				"BidPrice10",
				"BidQtty01",
				"BidQtty02",
				"BidQtty03",
				"BidQtty04",
				"BidQtty05",
				"BidQtty06",
				"BidQtty07",
				"BidQtty08",
				"BidQtty09",
				"BidQtty10",
				"AskPrice01",
				"AskPrice02",
				"AskPrice03",
				"AskPrice04",
				"AskPrice05",
				"AskPrice06",
				"AskPrice07",
				"AskPrice08",
				"AskPrice09",
				"AskPrice10",
				"AskQtty01",
				"AskQtty02",
				"AskQtty03",
				"AskQtty04",
				"AskQtty05",
				"AskQtty06",
				"AskQtty07",
				"AskQtty08",
				"AskQtty09",
				"AskQtty10",
				"TotalBidQtty",
				"TotalAskQtty",
				"TradingSessionId",
				"ForeignBuyQtty",
				"ForeignSellQtty",
				"DayHigh",
				"DayLow",
				"AccumulatedVal",
				"AccumulatedVol",
				"MatchPrice",
				"MatchQtty",
				"CurrentPrice",
				"currentQtty",
				"ProjectOpen",
				"TotalRoom",
				"CurrentRoom"
			};
			_fieldLocatorDict["SFU"]["ST"] = FlipIndexValueList<string>(_fieldLocator["SFU"]["ST"]);

			_fieldLocator["SFU"]["S"] = new List<string> {
				"Symbol",
				"StockType",
				"ExchangeCode",
				"RefPrice",
				"FloorPrice",
				"CeilingPrice",
				"BidPrice01",
				"BidPrice02",
				"BidPrice03",
				"BidQtty01",
				"BidQtty02",
				"BidQtty03",
				"AskPrice01",
				"AskPrice02",
				"AskPrice03",
				"AskQtty01",
				"AskQtty02",
				"AskQtty03",
				"TotalBidQtty",
				"TotalAskQtty",
				"TradingSessionId",
				"ForeignBuyQtty",
				"ForeignSellQtty",
				"DayHigh",
				"DayLow",
				"AccumulatedVal",
				"AccumulatedVol",
				"MatchPrice",
				"MatchQtty",
				"CurrentPrice",
				"currentQtty",
				"ProjectOpen",
				"TotalRoom",
				"CurrentRoom"
			};
			_fieldLocatorDict["SFU"]["S"] = FlipIndexValueList<string>(_fieldLocator["SFU"]["S"]);

			_fieldLocator["SMA"] = new Dictionary<string, List<string>>();
			_fieldLocatorDict["SMA"] = new Dictionary<string, Dictionary<string, int>>();
			_fieldLocator["SMA"]["S"] = _fieldLocator["SMA"]["ST"] = new List<string> {
				"Symbol",
				"StockType",
				"TradingSessionId",
				"ForeignBuyQtty",
				"ForeignSellQtty",
				"DayHigh",
				"DayLow",
				"AccumulatedVal",
				"AccumulatedVol",
				"MatchPrice",
				"MatchQtty",
				"CurrentPrice",
				"CurrentQtty",
				"ProjectOpen",
				"TotalRoom",
				"CurrentRoom"
			};
			_fieldLocatorDict["SMA"]["S"] = _fieldLocatorDict["SMA"]["ST"] = FlipIndexValueList<string>(_fieldLocator["SMA"]["S"]);

			_fieldLocator["SBA"] = new Dictionary<string, List<string>>();
			_fieldLocatorDict["SBA"] = new Dictionary<string, Dictionary<string, int>>();
			_fieldLocator["SBA"]["S"] = new List<string> {
				"Symbol",
				"StockType",
				"BidPrice01",
				"BidPrice02",
				"BidPrice03",
				"BidQtty01",
				"BidQtty02",
				"BidQtty03",
				"AskPrice01",
				"AskPrice02",
				"AskPrice03",
				"AskQtty01",
				"AskQtty02",
				"AskQtty03",
				"TotalBidQtty",
				"TotalAskQtty"
			};
			_fieldLocatorDict["SBA"]["S"] = FlipIndexValueList<string>(_fieldLocator["SBA"]["S"]);

			_fieldLocator["SBA"]["ST"] = new List<string> {
				"Symbol",
				"StockType",
				"BidPrice01",
				"BidPrice02",
				"BidPrice03",
				"BidPrice04",
				"BidPrice05",
				"BidPrice06",
				"BidPrice07",
				"BidPrice08",
				"BidPrice09",
				"BidPrice10",
				"BidQtty01",
				"BidQtty02",
				"BidQtty03",
				"BidQtty04",
				"BidQtty05",
				"BidQtty06",
				"BidQtty07",
				"BidQtty08",
				"BidQtty09",
				"BidQtty10",
				"AskPrice01",
				"AskPrice02",
				"AskPrice03",
				"AskPrice04",
				"AskPrice05",
				"AskPrice06",
				"AskPrice07",
				"AskPrice08",
				"AskPrice09",
				"AskPrice10",
				"AskQtty01",
				"AskQtty02",
				"AskQtty03",
				"AskQtty04",
				"AskQtty05",
				"AskQtty06",
				"AskQtty07",
				"AskQtty08",
				"AskQtty09",
				"AskQtty10",
				"TotalBidQtty",
				"TotalAskQtty"
			};
			_fieldLocatorDict["SBA"]["ST"] = FlipIndexValueList<string>(_fieldLocator["SBA"]["ST"]);

			_fieldSeparator = "|";
		}

		public static Message Parse(string decodedMessage, string messageNamespace)
		{
			// min string of parseable message is 5 -> 
			if (decodedMessage is null
				|| decodedMessage.Length < 5)
			{
				return null;
			}
			var msgArr = decodedMessage.Split(_fieldSeparator);
			if (msgArr.Length < 3)
				return null;
			var msgType = msgArr[0];
			var stockType = msgArr[2];
			var className = $"{msgType}_{stockType}";
			Message msgObj;
			try
			{
				msgObj = GetMessageInstance(messageNamespace, className);
			}
			catch
			{
				return null;
			}
			if (msgObj is null)
			{
				return null;
			}
			if (_fieldLocator[msgType][stockType].Count + 1 != msgArr.Length)
			{
				return null;
			}
			msgObj.MessageType = msgType;
			msgObj.StockType = stockType;
			var typeObj = msgObj.GetType();

			for (var i = 0; i < _fieldLocator[msgType][stockType].Count; ++i)
			{
				var propName = _fieldLocator[msgType][stockType][i];
				var prop = typeObj.GetProperty(propName);
				if (prop is null)
				{
					prop = typeObj.BaseType.GetProperty(propName);
					if (prop is null)
						throw new ArgumentException();
				}
				prop.SetValue(msgObj, GetValueObject(msgArr[i + 1], prop));
			}

			return msgObj;
		}

		public static object SafeAccessArray<T>(T[] arr, int idx)
        {
            if (idx > 0 && idx < arr.Length)
                return arr[idx];
            return null;
        }

		public static Message GetMessageInstance(string ns, string className)
		{
			if (string.IsNullOrEmpty(ns))
				return null;
			var t = Type.GetType($"{ns}.{className}");

			return (Message)Activator.CreateInstance(t);
		}

		public static object GetValueObject(string numStr, PropertyInfo prop)
		{
			object safeVal;
			try
			{
				var t = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
				safeVal = string.IsNullOrEmpty(numStr) ? null : Convert.ChangeType(numStr, t);
			}
			catch
			{
				safeVal = null;
			}

			return safeVal;
		}

		public static T CastObject<T>(object input)
		{
			return (T)input;
		}

		public static T ConvertObject<T>(object input)
		{
			return (T)Convert.ChangeType(input, typeof(T));
		}
	}


}