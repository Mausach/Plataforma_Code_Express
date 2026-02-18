import axios from "axios";
//http://localhost:4002 //test local
//linck server en render
//https://plataforma-code-express-backend.onrender.com

export const authApi=axios.create({
    baseURL: "https://plataforma-code-express-backend.onrender.com",   
});


authApi.interceptors.request.use((config) => {
	config.headers = {
		'x-token': localStorage.getItem('token'),
	};
	return config;
});

export default authApi;