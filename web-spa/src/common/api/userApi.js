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
	watchlists: {
		method: 'get',
		path: '/api/watchlist'
	},
	watchlistDetail: {
		method: 'get',
		path: '/api/watchlist'
	},
	removeWatchlist: {
		method: 'delete',
		path: '/api/watchlist'
	},
	insertWatchlist: {
		method: 'post',
		path: '/api/watchlist'
	},
	updateWatchlist: {
		method: 'put',
		path: '/api/watchlist'
	},
	insertWatchlistSymbol: {
		method: 'post',
		path: '/api/watchlist/symbol'
	},
}

export default userApi;