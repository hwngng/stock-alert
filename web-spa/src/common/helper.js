const Helper = {
	isValidEmail: function (str) {
		if (!str) return false;
		return String(str)
			.toLowerCase()
			.match(
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/
			);
	}
}

export default Helper;