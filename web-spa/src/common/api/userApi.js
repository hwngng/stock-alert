const userApi = {
	login: {
		method: 'post',
		path: '/api/auth/token'
	},
	register: {
		method: 'post',
		path: '/api/auth/register'
	},
	currentUser: {
		method: 'get',
		path: '/api/user/current'
	}
}

export default userApi;