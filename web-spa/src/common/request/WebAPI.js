import axios from "axios";

const WebAPI = (apiHost='') => {
	let instance = axios.create({
		baseURL: apiHost,
		timeout: 30000,
		headers: {
			'Content-Type': 'application/json',
		},
		paramsSerializer: params => (new URLSearchParams(params)).toString()
	});

	return instance;
};

export default WebAPI;