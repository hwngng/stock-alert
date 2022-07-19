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
	alertOptions: {
		method: 'get',
		path: '/api/alertOption'
	},
	alertOptionDetail: {
		method: 'get',
		path: '/api/alertOption'
	},
	removeAlertOption: {
		method: 'delete',
		path: '/api/alertOption'
	},
	insertAlertOption: {
		method: 'post',
		path: '/api/alertOption'
	},
	updateAlertOption: {
		method: 'put',
		path: '/api/alertOption'
	},
	alertTypes: {
		method: 'get',
		path: '/api/alertType'
	},
	alertTypeDetail: {
		method: 'get',
		path: '/api/alertType'
	},
}

export default userApi;