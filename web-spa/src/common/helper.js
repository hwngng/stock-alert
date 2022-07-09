const Helper = {
	isValidEmail: function (str) {
		if (!str) return false;
		return String(str)
			.toLowerCase()
			.match(
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/
			);
	},
	createCookie: function (cookieName, cookieValue, expireTimeMs, options) {
		// document.cookie = "doSomethingOnlyOnce=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=None; Secure";
		let date = new Date(expireTimeMs);
		let cookieStr = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString() + (options ? '; ' + options : '');
		document.cookie = cookieStr;
	},
	getCookie: function (cookieName) {
		// a=bcd;e=fgh
		let name = cookieName + "=";
		let allCookieArray = document.cookie.split(';');
		for (let i = 0; i < allCookieArray.length; i++) {
			let temp = allCookieArray[i].trim();
			if (temp.indexOf(name) == 0)
				return temp.substring(name.length, temp.length);
		}
		return "";
	},
	// get medium from sorted fragment of array [start, end]
	getMedium: function (arr, start = 0, end = -1) {
		if (!arr) return null;
		if (end < 0) end = arr.length - 1;
		return arr[Math.floor((start + end) / 2)];
	},
	// remove adjacent element from array. Take medium.
	// example:
	// input: [1, 2, 3, 5, 6, 10,13,19,18]
	// output: [ 2, 5, 10, 13, 18 ]
	accumulateAdjPoint: function (arr, adjDistance) {
		if (!Array.isArray(arr)) return;
		let distinct = Array.from(new Set(arr)).sort((a, b) => a - b);
		let isAdj = false;
		let arrNoAdj = [];
		let startFrag = 0, endFrag = 0;
		for (let i = 0; i < distinct.length; ++i) {
			let j = i + 1;

			if (j < distinct.length && distinct[j] - distinct[i] <= adjDistance) {
				if (!isAdj) {
					startFrag = i;
				}
				isAdj = true;
				endFrag = j;
			} else {
				if (isAdj) {
					let med = this.getMedium(distinct, startFrag, endFrag);
					arrNoAdj.push(med);
				} else {
					arrNoAdj.push(distinct[i]);
				}
				isAdj = false;
			}
		}

		return arrNoAdj;
	},
    dropFalsyFields(obj) {
        let newObj = {};
        for (const key in obj) {
            if (obj[key]) {
                newObj[key] = obj[key];
            }
        }

        return newObj;
    },
	isEqual(arg1, arg2) {
		if (!arg1 && !arg2)
			return true;
		return arg1 == arg2;
	}
}

export default Helper;
// exports.Helper = Helper;