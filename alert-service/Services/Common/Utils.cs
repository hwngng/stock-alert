using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using AlertService.Services.Models;

namespace AlertService.Services.Common
{
	public static class Utils
	{
		public static string DecodeSocketData(string source)
		{
			source = "";
			return source;
		}

		public static long GetEpochTimeSec(DateTime dt)
		{
			var tOffset = dt.ToUniversalTime() - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

			return (long)tOffset.TotalSeconds;
		}

		public static decimal GetChangeRatio(decimal before, decimal current)
		{
			return (current - before) / before;
		}

		public static List<OHLCV> GetLastNTradingDay(List<OHLCV> ohlcs, SMAGeneral sma, int n)
		{
			if (n > ohlcs.Count)
				n = ohlcs.Count;
			var from = ohlcs.Count - n >= 0 ? ohlcs.Count - n : 0;
			if (sma is null)
			{
				return ohlcs.GetRange(from, n);
			}
			var last = ohlcs[ohlcs.Count - 1];
			OHLCV currentOhlc = null;
			if (last.Date.Date == DateTime.UtcNow.Date)
			{       // take open price
				currentOhlc = last.CreateCopy();
			}
			else
			{
				currentOhlc = new OHLCV();
				currentOhlc.Open = sma.MatchPrice.Value;
			}
			currentOhlc.Close = sma.MatchPrice.Value;
			currentOhlc.High = sma.DayHigh.Value;
			currentOhlc.Low = sma.DayLow.Value;
			currentOhlc.Volume = sma.AccumulatedVol.Value;


			var lastN = ohlcs.GetRange(from, n - 1);
			lastN.Add(currentOhlc);

			return lastN;
		}
	}

	public class NullableConverterFactory : JsonConverterFactory
	{
		static readonly byte[] Empty = Array.Empty<byte>();

		public override bool CanConvert(Type typeToConvert) => Nullable.GetUnderlyingType(typeToConvert) != null;

		public override JsonConverter CreateConverter(Type type, JsonSerializerOptions options) =>
			(JsonConverter)Activator.CreateInstance(
				typeof(NullableConverter<>).MakeGenericType(
					new Type[] { Nullable.GetUnderlyingType(type) }),
				BindingFlags.Instance | BindingFlags.Public,
				binder: null,
				args: new object[] { options },
				culture: null);

		class NullableConverter<T> : JsonConverter<T?> where T : struct
		{
			// DO NOT CACHE the return of (JsonConverter<T>)options.GetConverter(typeof(T)) as DoubleConverter.Read() and DoubleConverter.Write()
			// DO NOT WORK for nondefault values of JsonSerializerOptions.NumberHandling which was introduced in .NET 5
			public NullableConverter(JsonSerializerOptions options) { }

			public override T? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
			{
				if (reader.TokenType == JsonTokenType.String)
				{
					if (reader.ValueTextEquals(Empty))
						return null;
				}
				return JsonSerializer.Deserialize<T>(ref reader, options);
			}

			public override void Write(Utf8JsonWriter writer, T? value, JsonSerializerOptions options) =>
				JsonSerializer.Serialize(writer, value.Value, options);
		}
	}

	public class CustomDateTimeConverter : JsonConverter<DateTime>
	{
		public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
		{
			if (typeToConvert == typeof(DateTime))
			{
				return DateTime.SpecifyKind(DateTime.Parse(reader.GetString() ?? string.Empty), DateTimeKind.Utc);
			}
			return JsonSerializer.Deserialize<DateTime>(ref reader, options);
		}

		public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
		{
			JsonSerializer.Serialize(writer, value, options);
		}
	}
}