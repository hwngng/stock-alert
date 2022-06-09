import axios from "axios";

const WebAPI = (apiHost='') => {
	let instance = axios.create({
		baseURL: apiHost,
		timeout: 30000,
		headers: {
			'Content-Type': 'application/json',
		}
	});

	return instance;
};

export default WebAPI;