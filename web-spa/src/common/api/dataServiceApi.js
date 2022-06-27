const dataServiceApi = {
	stockInfo: {
		method: 'get',
		path: '/stock/info'
	},
	snapshot: {
		method: 'get',
		path: '/stock/snapshot'
	},
	realtime: {
		method: 'ws',
		path: '/realtime'
	},
	history: {
		method: 'get',
		path: '/stock/history'
	},
	historyWithCurr: {
		method: 'get',
		path: '/stock/history/withCurr'
	}
}

export default dataServiceApi;