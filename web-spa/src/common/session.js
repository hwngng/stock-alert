import axios from "axios";
import userApi from "./api/userApi";


const Session = {
	getSession: async function (tokenModel, webApiHost) {
		let accessToken = tokenModel['token'];
		if (!accessToken)
			return null;
		let user = null;
		try {
			let response = await axios({
				method: userApi.currentUser.method,
				url: (new URL(userApi.currentUser.path, webApiHost)).toString(),
				headers: { 'Authorization': 'Bearer ' + accessToken }
			});
			user = response.data;
		} catch (e) {
			console.log(e);
			return null;
		}
		if (!user)
			return null;
		let msigSession = { ...user, ...tokenModel };
		return msigSession
	},
	getSessionLocal: function () {
		let msigSession = null;
		try {
			let msigSessionStr = localStorage.getItem('msigSession');
			if (msigSessionStr)
				msigSession = JSON.parse(msigSessionStr);
		} catch (e) {
			console.log(e);
		}

		return msigSession;
	},
	clearSession: function () {
		localStorage.removeItem('msigSession');
	}
}

export default Session;