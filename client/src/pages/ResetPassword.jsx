import React, { useEffect, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    tempToken: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = data.newPassword && data.confirmPassword && data.tempToken && 
                 (data.newPassword === data.confirmPassword);

  useEffect(() => {
    if (!location?.state?.tempToken) {
      toast.error("Invalid access. Please request a new password reset.");
      navigate("/forgot-password");
      return;
    }

    setData(prev => ({
      ...prev,
      email: location?.state?.email || "",
      tempToken: location?.state?.tempToken || ""
    }));
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (data.newPassword !== data.confirmPassword) {
      toast.error("New password and confirm password must match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: {
          tempToken: data.tempToken,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        }
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eff8f9d6] to-[#f3e8ded7]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#30459D]">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Create a new password for {location?.state?.email || 'your account'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={data.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D] outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-3 text-gray-500 hover:text-[#30459D]"
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30459D] focus:border-[#30459D] outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-3 text-gray-500 hover:text-[#30459D]"
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition
              ${isValid && !isLoading 
                ? 'bg-[#30459D] hover:bg-[#263685]' 
                : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
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

export default ResetPassword;