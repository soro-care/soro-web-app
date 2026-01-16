import axios from "axios";
import SummaryApi , { baseURL } from "../common/SummaryApi";
// const NODE_ENV = import.meta.env.NODE_ENV

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: true
})

Axios.interceptors.request.use(
    async(config)=>{
        const accessToken = localStorage.getItem('accessToken')

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)


Axios.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      const originalRequest = error.config
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          try {
            const newAccessToken = await refreshAccessToken(refreshToken)
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              return Axios(originalRequest)
            }
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError)
            localStorage.clear()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }
      }
      return Promise.reject(error)
    }
  )


// In Axios.js
const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await axios({
        url: SummaryApi.refreshToken.url,
        method: SummaryApi.refreshToken.method,
        headers: {
          Authorization: `Bearer ${refreshToken}`
        },
        baseURL
      });
  
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return newAccessToken;
    } catch (error) {
      console.error("Refresh token error:", error);
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }
  };

export default Axios