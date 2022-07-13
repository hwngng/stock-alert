import axios from "axios";
import userApi from "../api/userApi";
import Helper from "../helper";
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
			let isRefreshingToken = sessionStorage.getItem('isRefreshingToken');
			let waitCounter = 0;
			while (isRefreshingToken == '1' && waitCounter < 5) {
				await Helper.sleep(500);
				isRefreshingToken = sessionStorage.getItem('isRefreshingToken');
				++waitCounter;
			}
			if (error.response.status === 401 && !originalRequest._retry && isRefreshingToken != '1') {
				originalRequest._retry = true;
				sessionStorage.setItem('isRefreshingToken', '1');
				const newTokenModel = await refreshAccessToken(apiHost, tokenModel);
				tokenModel = newTokenModel;
				Session.saveAuth(newTokenModel);
				sessionStorage.removeItem('isRefreshingToken');
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + tokenModel['accessToken'];
				return instance(originalRequest);
			}
			return Promise.reject(error);
		});

	return instance;
};

export default WebAPIAuth;