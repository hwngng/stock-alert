const axios = require("axios");

const auth = async (req, res, next) => {
	const token = req.header('Authorization')?.replace('Bearer ', '')
	try {
		const resp = await axios({
			url: req.config.adminAuthApi,
			method: 'get',
			headers: {
				'Authorization': 'Bearer ' + token
			}
		})
		if (!resp.data['isAdmin'])
			throw 'Invalid access token';
		next();
	} catch (error) {
		res.status(403).send({ error: 'Not authorized to access this resource' })
	}
}

module.exports = auth