function decodeVNDdata (source) {
	let rotate = 5;
	// char sep = '|';
	let newSource = '';
	
	for (let i = 0; i < source.length; ++i) {
		newSource += String.fromCharCode(source[i].charCodeAt(0) + i % rotate);
	}
	
	return newSource;
}

function filterVNDmessage (socketMessage) {
	var result = [];
	var sep = '|';
	var sepMsg = ':';

	if (socketMessage.length >= 3) {
		var sepIdx = socketMessage.indexOf(sep);
		var sepMsgIdx = socketMessage.indexOf(sepMsg);
		if (sepIdx > 0 && sepMsgIdx > 0) {
			result.push(socketMessage.substring(0, sepIdx));
			result.push(socketMessage.substring(sepIdx+1, sepMsgIdx - sepIdx - 1));
			result.push(socketMessage.substring(sepMsgIdx+1));
		}
	}

	return result;
}
var format = {}
format["SFU"] = {};
format["SFU"]["ST"] = [
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
];
format["SFU"]["S"] = [
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
];
format["SMA"] = {};
format["SMA"]["S"] = format["SMA"]["ST"] = [
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
	"CurrentRoom",
];
format["SBA"] = {};
format["SBA"]["S"] = [
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
];
format["SBA"]["ST"] = [
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
];
format["sep"] = "|";

function mapObjVND (message) {
	let msgArr = message.split(format["sep"]);
	let msgObj = {};
	let msgType = msgArr[0];
	let stockType = msgArr[2];
	
	if (!msgType || !stockType) {
		return msgObj;
	}

	if (!(msgType in format) || !(stockType in format[msgType])) {
		return msgObj;
	}

	if (format[msgType][stockType].length + 1 > msgArr.length) {
		return msgObj;
	}

	for (let i = 0; i < format[msgType][stockType].length; ++i) {
		msgObj[format[msgType][stockType][i]] = msgArr[i+1];
	}

	return msgObj;
}

function getMetaMessage (message) {
	let msgArr = message.split(format["sep"]);
	let msgObj = {};
	let msgType = msgArr[0];
	let stockType = msgArr[2];
	let icode = format[msgType][stockType].indexOf('Symbol');
	let symbol = msgArr[icode+1];
	return {
		messageType: msgType,
		stockType: stockType,
		symbol: symbol
	}
}

exports.decodeVNDdata = decodeVNDdata;
exports.filterVNDmessage = filterVNDmessage;
exports.mapObjVND = mapObjVND;
exports.getMetaMessage = getMetaMessage;