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
		let cookieStr = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString() + (options ? '; '+options : '');
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
	}
}

export default Helper;