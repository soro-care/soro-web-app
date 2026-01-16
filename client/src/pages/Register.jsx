import { useState } from 'react'
import { FaRegEyeSlash, FaRegEye, FaArrowLeft } from "react-icons/fa6";
import { Loader } from "lucide-react";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import auths from '../assets/auths.png'

const Register = () => {
    const [step, setStep] = useState(1); // 1: registration form, 2: OTP verification
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [emailSent, setEmailSent] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus to next input
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain').trim();
        if (pasteData.length === 4 && !isNaN(pasteData)) {
            const pasteArray = pasteData.split('');
            setOtp(pasteArray);
            document.getElementById(`otp-3`).focus();
        }
    };

    const valideForm = Object.values(formData).every(el => el);
    const validOtp = otp.every(num => num) && otp.join('').length === 4;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Combine first and last name
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        const payload = {
            name: fullName,
            email: formData.email,
            password: formData.password
        };

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data: payload
            });

            if (response.data.error) {
                toast.error(response.data.message);
            }

            if (response.data.success) {
                setEmailSent(formData.email);
                setStep(2);
                toast.success("OTP sent to your email");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.verifyOtp,
                data: {
                    email: emailSent,
                    otp: otp.join('')
                }
            });

            if (response.data.error) {
                toast.error(response.data.message);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: ""
                });
                setOtp(["", "", "", ""]);
                navigate("/login");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.resendOtp,
                data: { email: emailSent }
            });

            if (response.data.error) {
                toast.error(response.data.message);
            }

            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E7F5F7] to-[#F3E8DE] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Mobile View - Single Column */}
                <div className="block md:hidden">
                    <div className="relative w-full px-6 pt-16 pb-8">
                        <button 
                            onClick={() => step === 1 ? navigate('/') : setStep(1)}
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
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                {step === 1 ? "Create an account" : "Verify your email"}
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                {step === 1 ? (
                                    <>
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-[#30459D] hover:underline">
                                            Login
                                        </Link>
                                    </>
                                ) : (
                                    `Enter the 4-digit code sent to ${emailSent}`
                                )}
                            </p>
                        </motion.div>

                        {step === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                                value={formData.firstName}
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
                                                value={formData.lastName}
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
                                            value={formData.email}
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
                                                value={formData.password}
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

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30459D] hover:bg-[#190D39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30459D] transition duration-150 ease-in-out disabled:opacity-50"
                                            disabled={!valideForm || loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                                    Loading...
                                                </>
                                            ) : "Continue"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="flex justify-center gap-3 mb-8">
                                        {[0, 1, 2, 3].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={otp[index]}
                                                onChange={(e) => handleOtpChange(e, index)}
                                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                onPaste={handlePaste}
                                                className="w-16 h-16 text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D]"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center text-sm text-gray-600 mb-6">
                                        Didn't receive a code?{" "}
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="text-[#30459D] hover:underline focus:outline-none disabled:opacity-50"
                                            disabled={resendLoading}
                                        >
                                            {resendLoading ? "Sending..." : "Resend"}
                                        </button>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30459D] hover:bg-[#190D39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30459D] transition duration-150 ease-in-out disabled:opacity-50"
                                            disabled={!validOtp || loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                                    Verifying...
                                                </>
                                            ) : "Verify & Create Account"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
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
                            onClick={() => step === 1 ? navigate('/') : setStep(1)}
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
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {step === 1 ? "Create an account" : "Verify your email"}
                            </h2>
                            <p className="text-gray-600">
                                {step === 1 ? (
                                    <>
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-[#30459D] hover:underline">
                                            Login
                                        </Link>
                                    </>
                                ) : (
                                    `Enter the 4-digit code sent to ${emailSent}`
                                )}
                            </p>
                        </motion.div>

                        {step === 1 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                                value={formData.firstName}
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
                                                value={formData.lastName}
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
                                            value={formData.email}
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
                                                value={formData.password}
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

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30459D] hover:bg-[#190D39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30459D] transition duration-150 ease-in-out disabled:opacity-50"
                                            disabled={!valideForm || loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                                    Loading...
                                                </>
                                            ) : "Continue"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="flex justify-center gap-3 mb-8">
                                        {[0, 1, 2, 3].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={otp[index]}
                                                onChange={(e) => handleOtpChange(e, index)}
                                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                onPaste={handlePaste}
                                                className="w-16 h-16 text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D]"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center text-sm text-gray-600 mb-6">
                                        Didn't receive a code?{" "}
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="text-[#30459D] hover:underline focus:outline-none disabled:opacity-50"
                                            disabled={resendLoading}
                                        >
                                            {resendLoading ? "Sending..." : "Resend"}
                                        </button>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#30459D] hover:bg-[#190D39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#30459D] transition duration-150 ease-in-out disabled:opacity-50"
                                            disabled={!validOtp || loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                                    Verifying...
                                                </>
                                            ) : "Verify & Create Account"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;