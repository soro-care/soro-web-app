import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import fetchUserDetails from '../utils/fetchUserDetails';
import { setUserDetails } from '../store/userSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Axios from '../utils/Axios';

const Authenticated = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
          throw new Error('No tokens found');
        }

        // Verify tokens by making a simple authenticated request 
        const userData = await fetchUserDetails();
        dispatch(setUserDetails(userData.data));

      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.clear();
        setShouldRedirect(true);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [dispatch]);

  if (isChecking) {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <LoadingSpinner/>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only return children if user is authenticated
  return user?._id ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default Authenticated;