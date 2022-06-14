import axios from "axios";

const DataService = (dataServiceHost='') => {
	let instance = axios.create({
		baseURL: dataServiceHost,
		timeout: 30000,
		headers: {
			'Content-Type': 'application/json',
		},
		paramsSerializer: params => (new URLSearchParams(params)).toString()
	});

	return instance;
};

export default DataService;