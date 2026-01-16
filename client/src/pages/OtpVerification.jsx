import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link } from 'react-router-dom';

const OtpVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location?.state?.email) {
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow numbers
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text/plain').slice(0, 6);
        if (/^\d+$/.test(pasteData)) {
            const newOtp = [...otp];
            pasteData.split('').forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification,
                data: {
                    otp: otp.join(''),
                    email: location?.state?.email
                }
            });

            if (response.data.error) {
                toast.error(response.data.message);
            } else {
                toast.success(response.data.message);
                console.log("Navigating with:", {
                tempToken: response.data.tempToken,
                email: location?.state?.email
                })
                navigate('/reset-password', {
                    state: {
                        tempToken: response.data.tempToken,
                        email: location?.state?.email
                    }
                });
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-[#30459D]">Verify OTP</h1>
                    <p className="text-gray-600 mt-2">
                        Enter the 6-digit code sent to {location?.state?.email || 'your email'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-full h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D] outline-none transition"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isOtpComplete || isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition
                            ${isOtpComplete && !isLoading 
                                ? 'bg-[#30459D] hover:bg-[#263685]' 
                                : 'bg-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive code?{' '}
                        <button 
                            type="button"
                            className="font-medium text-[#30459D] hover:text-[#263685] hover:underline"
                            onClick={() => toast('Resend functionality would go here')}
                        >
                            Resend
                        </button>
                    </p>
                    <p className="mt-4 text-sm text-gray-600">
                        Remember your password?{' '}
                        <Link 
                            to="/login" 
                            className="font-medium text-[#30459D] hover:text-[#263685] hover:underline"
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;