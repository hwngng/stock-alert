import userApi from "./api/userApi";
import WebAPIAuth from "./request/WebAPIAuth";


const Session = {
	getUser: async function (tokenModel, webApiHost) {
		let accessToken = tokenModel['accessToken'];
		if (!accessToken)
			return null;
		let user = null;
		try {
			const apiRequest = WebAPIAuth(webApiHost, tokenModel);
			let response = await apiRequest(userApi.currentUser.path, {
				method: userApi.currentUser.method,
			});
			user = response.data;
		} catch (e) {
			console.log(e);
			return null;
		}
		if (!user)
			return null;
		return user;
	},
	saveAuth: function (tokenModel) {
		if (!tokenModel)
			return;
		localStorage.setItem('authSession', JSON.stringify(tokenModel));
	},
	getAuth: function () {
		try {
			let tokenModelStr = localStorage.getItem('authSession');
			if (tokenModelStr) {
				let tokenModel = JSON.parse(tokenModelStr);
				return tokenModel;
			} 
		} catch (e) {
			console.log(e);
		}

		return null;
	},
	saveSession: function (user, tokenModel) {
		if (!user || !tokenModel) return;
		localStorage.setItem('userSession', JSON.stringify(user));
		this.saveAuth(tokenModel);
	},
	getSession: function () {
		let userSession = null;
		let authSession = null;
		try {
			let userSessionStr = localStorage.getItem('userSession');
			if (userSessionStr) {
				userSession = JSON.parse(userSessionStr);
			}
			let authSessionStr = localStorage.getItem('authSession');
			if (authSessionStr) {
				authSession = JSON.parse(authSessionStr);
			}
		} catch (e) {
			console.log(e);
		}
		if (!userSession || !authSession)
			return {};
		let msigSession  = {authSession, userSession};
		return msigSession;
	},
	clearSession: function () {
		localStorage.removeItem('userSession');
		localStorage.removeItem('authSession');
	}
}

export default Session;