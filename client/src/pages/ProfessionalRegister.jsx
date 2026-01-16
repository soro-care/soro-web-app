import { useState } from 'react';
import { FaRegEyeSlash, FaRegEye, FaArrowLeft } from "react-icons/fa6";
import { Loader } from "lucide-react";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import auths from '../assets/auths.png';

const ProfessionalRegister = () => {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        isPeerCounselor: false
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const valideValue = data.firstName && data.lastName && data.email && data.password;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fullName = `${data.firstName} ${data.lastName}`.trim();
        const payload = {
            name: fullName,
            email: data.email,
            password: data.password,
            isPeerCounselor: data.isPeerCounselor
        };

        try {
            const response = await Axios({
                ...SummaryApi.registerProfessional,
                data: payload
            });
            
            if(response.data.error) {
                toast.error(response.data.message);
            }

            if(response.data.success) {
                toast.success(response.data.message);
                setData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    isPeerCounselor: false
                });
                navigate("/login");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const renderFormFields = () => (
        <>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        autoFocus
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                        name="firstName"
                        value={data.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                        name="lastName"
                        value={data.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                </label>
                <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="block w-full px-4 py-3 pl-4 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-[#30459D] focus:border-[#30459D] sm:text-sm"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                    />
                    <div 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(prev => !prev)}
                    >
                        {showPassword ? <FaRegEye className="h-5 w-5 text-gray-400" /> : <FaRegEyeSlash className="h-5 w-5 text-gray-400" />}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        id="isPeerCounselor"
                        name="isPeerCounselor"
                        checked={data.isPeerCounselor}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#30459D] bg-gray-100 border-gray-300 rounded focus:ring-[#30459D] focus:ring-2"
                    />
                    <label htmlFor="isPeerCounselor" className="ml-2 text-sm font-medium text-gray-700">
                        I am a Peer Counselor
                    </label>
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
                    ) : "Register as Professional"}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E7F5F7] to-[#F3E8DE] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Mobile View - Single Column */}
                <div className="block md:hidden">
                    <div className="relative w-full px-6 pt-16 pb-8">
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
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Professional Registration</h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Already have an account?{" "}
                                <Link to="/login" className="text-[#30459D] hover:underline">
                                    Login
                                </Link>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {renderFormFields()}
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Professional Registration</h2>
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link to="/login" className="text-[#30459D] hover:underline">
                                    Login
                                </Link>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {renderFormFields()}
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalRegister;