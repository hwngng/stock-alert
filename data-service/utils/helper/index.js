function formatYYYYMMDD (date) {
	dtObj = new Date(date);
	return dtObj.toISOString().slice(0,10);
}

exports.set = require('./set');
exports.formatYYYYMMDD = formatYYYYMMDD;