import { useState } from 'react'
import { FaRegEyeSlash, FaRegEye, FaArrowLeft } from "react-icons/fa6";
import { Mail, Loader, Lock } from "lucide-react";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import { motion } from "framer-motion";
import auths from '../assets/auths.png'

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleChange = (e) => {
        const { name, value } = e.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const valideValue = Object.values(data).every(el => el)

    const checkSurveyStatus = async () => {
    try {
        // First get user details to check role
        const userDetails = await fetchUserDetails();
        const role = userDetails.data.role;
        
        const from = location.state?.from?.pathname || '/dashboard';

        // Only check survey status if user role is "USER"
        if (role === "USER") {
        const response = await Axios({
            ...SummaryApi.checkSurvey,
            headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        
        if (!response.data.completed) {
            navigate('/survey', { state: { from: location.state?.from }, replace: true });
        } else {
            navigate(from, { replace: true });
        }
        } else {
        // For non-USER roles, go directly to dashboard
        navigate(from, { replace: true });
        }
    } catch (error) {
        console.error('Survey check error:', error);
        navigate('/dashboard', { replace: true });
    }
    };

    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data: data
            })
            
            if(response.data.error){
                toast.error(response.data.message)
            }

            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('accessToken', response.data.data.accessToken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({ email: "", password: "" })
                await checkSurveyStatus();
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7F5F7] to-[#F3E8DE] flex items-center justify-center p-4">
        {/* Card Container */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Mobile View - Single Column */}
            <div className="block md:hidden">
                <div className="relative w-full px-6 pt-16 pb-8"> {/* Added pt-16 for spacing */}
                    {/* Back button inside form container */}
                    <button 
                        onClick={() => navigate('/')}
                        className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#30459D] transition-colors duration-200"
                    >
                        <FaArrowLeft className="text-lg" />
                    </button>
                    
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Login to your account</h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-[#30459D] hover:underline">
                                Register
                            </Link>
                        </p>
                    </motion.div>
    
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            className="block w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="block w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                            name="password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                        <div 
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <FaRegEye className="h-5 w-5 text-gray-400" /> : <FaRegEyeSlash className="h-5 w-5 text-gray-400" />}
                        </div>
                    </div>
                    <div className="text-right mt-2">
                        <Link to="/forgot-password" className="text-sm text-[#30459D] hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30459D] hover:bg-[#190D39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30459D] transition duration-150 ease-in-out disabled:opacity-50"
                        disabled={!valideValue || loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                Loading...
                            </>
                        ) : "Login"}
                    </button>
                </div>
            </form>
        </motion.div>
        </div>
        </div>
      
          {/* Desktop View - Split Screen */}
          <div className="hidden md:flex">
            {/* Left Side - Image */}
            <div className="w-1/2 bg-gray-50 p-12 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full"
              >
                <img
                  src={auths}
                  alt="Authentication"
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                />
              </motion.div>
            </div>
      
            {/* Right Side - Form */}
            <div className="w-1/2 p-12 relative">
              <button 
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#30459D] transition-colors duration-200"
              >
                <FaArrowLeft className="text-lg" />
              </button>
      
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Login to your account</h2>
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-[#30459D] hover:underline">
                    Register
                  </Link>
                </p>
              </motion.div>
      
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                        </label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                className="block w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="block w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            <div 
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <FaRegEye className="h-5 w-5 text-gray-400" /> : <FaRegEyeSlash className="h-5 w-5 text-gray-400" />}
                            </div>
                        </div>
                        <div className="text-right mt-2">
                            <Link to="/forgot-password" className="text-sm text-[#30459D] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30459D] hover:bg-[#190D39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30459D] transition duration-150 ease-in-out disabled:opacity-50"
                            disabled={!valideValue || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                    Loading...
                                </>
                            ) : "Login"}
                        </button>
                    </div>
                </form>
            </motion.div>

            </div>
          </div>
        </div>
      </div>
    )
}

export default Login


