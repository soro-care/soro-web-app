import { Outlet, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import './App.css'
import { useDispatch } from 'react-redux';
import Header from './components/Header'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import GlobalProvider from './provider/GlobalProvider';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (accessToken && refreshToken) {
          const userData = await fetchUserDetails()
          dispatch(setUserDetails(userData.data))
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        localStorage.clear()
      }
    }

    initializeAuth()
  }, [dispatch])

  // Check if path starts with /echoes (including all subpaths)
  const isEchoesPath = location.pathname.startsWith('/echoes');
  
  // Define other paths that should hide header/footer
  const noHeaderFooterPaths = ['/login', '/register'];
  
  // Combine checks: hide header/footer for echoes paths OR specific other paths
  const shouldHideHeaderFooter = isEchoesPath || noHeaderFooterPaths.includes(location.pathname);

  return (
    <GlobalProvider> 
      {/* Default meta tags for all pages */}
      <Helmet>
        <title>SORO - Because Your Mind Deserves Care</title>
        <meta name="description" content="Soro provides online mental health services and support, designed to address the growing mental health challenges faced by students and young people." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SORO - Because Your Mind Deserves Care" />
        <meta property="og:description" content="Soro provides online mental health services and support, designed to address the growing mental health challenges faced by students and young people." />
        <meta property="og:image" content="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png" />
        <meta property="og:url" content="https://soro.care" />
        <meta property="og:site_name" content="Soro" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SORO - Because Your Mind Deserves Care" />
        <meta name="twitter:description" content="Soro provides online mental health services and support, designed to address the growing mental health challenges faced by students and young people." />
        <meta name="twitter:image" content="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1757350261/soro-logo.png" />
      </Helmet>
      
      {!shouldHideHeaderFooter && <Header/>}
      <main className='min-h-[78vh] bg-gradient-to-br from-[#E7F5F7] to-[#F3E8DE]'>
        <Outlet/>
      </main>
      {!shouldHideHeaderFooter && <Footer/>}

      <Toaster/>
    </GlobalProvider>
  )
}

export default App