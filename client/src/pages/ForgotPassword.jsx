import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';

const ForgotPassword = () => {
    const [data, setData] = useState({ email: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data
            });
            
            if (response.data.error) {
                toast.error(response.data.message);
            } else {
                toast.success(response.data.message);
                navigate("/verification-otp", { state: data });
                setData({ email: "" });
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const isValid = data.email.includes('@') && data.email.includes('.');

    return (
        <section className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]'>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-8'>
                <div className='mb-8 text-center'>
                    <h1 className='text-2xl font-bold text-[#30459D]'>Forgot Password</h1>
                    <p className='text-gray-600 mt-2'>Enter your email to receive a password reset OTP</p>
                </div>

                <form className='space-y-6' onSubmit={handleSubmit}>
                    <div className='space-y-2'>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                            Email Address
                        </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D] outline-none transition'
                            placeholder='your@email.com'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={!isValid || loading}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition
                            ${isValid && !loading 
                                ? 'bg-[#30459D] hover:bg-[#263685]' 
                                : 'bg-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-600'>
                        Remember your password?{' '}
                        <Link 
                            to="/login" 
                            className='font-medium text-[#30459D] hover:text-[#263685] hover:underline'
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;