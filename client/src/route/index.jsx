import { createBrowserRouter, redirect } from "react-router-dom";  
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import Contact from "../pages/Contact";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
import UserMenuMobile from "../pages/UserMenuMobile";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import SurveyForm from "../pages/SurveyForm";
import Authenticated from "../layouts/Authenticated";
import Dashboard from "../pages/Dashboard";
import BookingForm from "../pages/BookingForm";
import Bookings from "../pages/Bookings";
import ProfessionalAvailability from "../pages/ProfessionalAvailability";
import Profile from "../pages/Profile";
import BlogPostDetail from "../pages/BlogPostDetail";
import SafeSpace from "../pages/SafeSpace";
import Blog from "../pages/Blog";
import BlogAdmin from "../pages/BlogAdmin";
// import BlogCategoriesAdmin from "../pages/BlogCategoriesAdmin"
import CreateBlogPost from "../pages/CreateBlogPost"
import EditBlogPost from "../pages/EditBlogPost"
import NotFound from "../pages/NotFound";
import ProfessionalRegister from "../pages/ProfessionalRegister";
import UsersAdmin from "../pages/UsersAdmin";
import BookingsAdmin from "../pages/BookingsAdmin";
import EchoRooms from "../pages/EchoRooms";


const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        errorElement: <NotFound />,
        children : [
            {
                path: "",
                element: <Home />,
                loader: async () => {
                    const accessToken = localStorage.getItem('accessToken');
                    const refreshToken = localStorage.getItem('refreshToken');
                    
                    if (accessToken && refreshToken) {
                        return redirect('/dashboard');
                    }
                    return null;
                }
            },
            {
                path : "search",
                element : <SearchPage/>
            },
            {
                path : "drops/:postSlug",
                element : <BlogPostDetail/>
            },
            {
                path : "drops",
                element : <Blog/>
            },
            {
                path : 'login',
                element : <Login/>
            },
            {
                path : "register",
                element : <Register/>
            },
            {
                path : "register-professional",
                element : <ProfessionalRegister/>
            },
            {
                path : 'about',
                element : <About/>
            },
            {
                path : "support",
                element : <Contact/>
            },
            {
                path : "forgot-password",
                element : <ForgotPassword/>
            },
            {
                path : "verification-otp",
                element : <OtpVerification/>
            },
            {
                path : "reset-password",
                element : <ResetPassword/>
            },
            {
                path : "user",
                element : <UserMenuMobile/>
            },

            {
                path : "success",
                element : <Success/>
            },
            {
                path : 'cancel',
                element : <Cancel/>
            },
            {
                path : 'survey',
                element : <Authenticated><SurveyForm/></Authenticated> 
            },
            {
                path : 'account',
                element : <Authenticated><Profile/></Authenticated> 
            },
            {
                path : 'dashboard',
                element : <Authenticated><Dashboard/></Authenticated> 
            },
            {
                path : 'safespace',
                element : <Authenticated><SafeSpace/></Authenticated> 
            },
            {
                path: 'availability',
                element: <Authenticated><ProfessionalAvailability /></Authenticated>
            },
                {
                path: 'bookings',
                element: <Authenticated><Bookings /></Authenticated>
            },
            {
                path: 'book/:professionalId',
                element: <Authenticated><BookingForm /></Authenticated>
            },
            {
                path: "admin/create",
                element: <CreateBlogPost />,
            },
            {
                path: "admin/edit/:postSlug",
                element: <EditBlogPost />,
            },
            {
                path: "admin/posts",
                element: <BlogAdmin />,
            },
            {
                path: "admin/users",
                element: <UsersAdmin />,
            },
            {
                path: "admin/bookings",
                element: <BookingsAdmin />,
            },
           {
                path: "echoes",
                element: <EchoRooms />,
            },
            {
                path: "echoes/room/:roomId",
                element: <EchoRooms />,
            },
            {
                path: "echoes/room/:roomId/story/:storyId",
                element: <EchoRooms />,
            }
            // {
            //     path: "admin/edit/:postId",
            //     element: <EditBlogPost />,
            // },
            // {
            //     path: "admin/categories",
            //     element: <BlogCategoriesAdmin />,
            // }
              
        ]
    }
], {
    basename: "/"
  })

export default router