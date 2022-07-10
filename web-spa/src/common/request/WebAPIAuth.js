import axios from "axios";
import userApi from "../api/userApi";
import Session from "../session";
import WebAPI from "./WebAPI";

const handleTokenInvalid = async (apiHost = null, tokenModel = null) => {
	Session.clearSession();
	if (apiHost && tokenModel) {
		let data = {
			accessToken: tokenModel['accessToken'],
			refreshToken: tokenModel['refreshToken']
		};
		const apiRequest = WebAPI(apiHost);
		let _ = await apiRequest(userApi.logout.path, {
			method: userApi.logout.method,
			data: data
		});
	}
	window.location = '/login';
}

const refreshAccessToken = async (apiHost, tokenModel) => {
	if (!tokenModel || !tokenModel['accessToken']) {
		await handleTokenInvalid();
	}

	let data = {
		accessToken: tokenModel['accessToken'],
		refreshToken: tokenModel['refreshToken']
	};
	try {
		let response = await axios({
			method: userApi.refreshToken.method,
			url: (new URL(userApi.refreshToken.path, apiHost)).toString(),
			data: data
		})
		let refreshModel = response.data;
		tokenModel['accessToken'] = refreshModel['accessToken'];
		tokenModel['refreshToken'] = refreshModel['refreshToken'];
		return tokenModel;
	} catch (e) {
		console.log(e);
		localStorage.setItem('errorRefresh', JSON.stringify(e));
		await handleTokenInvalid(apiHost, tokenModel);
	}
}

const WebAPIAuth = (apiHost = '', tokenModel = null) => {
	if (!tokenModel)
		tokenModel = Session.getAuth();

	let instance = axios.create({
		baseURL: apiHost,
		timeout: 30000,
		headers: {
			'Content-Type': 'application/json',
		},
		paramsSerializer: params => (new URLSearchParams(params)).toString()
	});
	instance.interceptors.request.use(
		config => {
			config.headers = {
				'Authorization': 'Bearer ' + tokenModel['accessToken'],
			}
			return config;
		},
		error => {
			Promise.reject(error)
		});

	instance.interceptors.response.use(
		response => {
			return response
		}, async function (error) {
			const originalRequest = error.config;
			if (error.response.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;
				const newTokenModel = await refreshAccessToken(apiHost, tokenModel);
				Session.saveAuth(newTokenModel);
				tokenModel = newTokenModel;
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + tokenModel['accessToken'];
				return instance(originalRequest);
			}
			return Promise.reject(error);
		});

	return instance;
};

export default WebAPIAuth;