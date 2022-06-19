function formatYYYYMMDD (date) {
	dtObj = new Date(date);
	return dtObj.toISOString().slice(0,10);
}

function dropFalsyFields(obj) {
	let newObj = {};
	for (const key in obj) {
		if (obj[key]) {
			newObj[key] = obj[key];
		}
	}

	return newObj;
}


exports.set = require('./set');
exports.formatYYYYMMDD = formatYYYYMMDD;
exports.dropFalsyFields = dropFalsyFields;