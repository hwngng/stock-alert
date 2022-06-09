const userApi = {
	login: {
		method: 'post',
		path: '/api/auth/token'
	},
	register: {
		method: 'post',
		path: '/api/auth/register'
	},
	refreshToken: {
		method: 'post',
		path: '/api/auth/refreshToken'
	},
	logout: {
		method: 'post',
		path: '/api/auth/logout'
	},
	currentUser: {
		method: 'get',
		path: '/api/user/current'
	},
	getWatchlists: {
		method: 'get',
		path: '/api/watchlist'
	}
}

export default userApi;