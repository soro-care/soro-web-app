import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Store, 
  Users,
  UserPlus,
  UserIcon,
  ChevronDown,
  PhoneCall,
  Bomb, Bot, MessageCircleHeart, Smile,
  BookHeart, CalendarCheck2, History, ClipboardList, BookOpenText, PenLine, FileText,
  Plus,
  PlusCircleIcon,
  Sparkles,
  Wifi
} from "lucide-react";
import { useSelector } from 'react-redux';
import useMobile from '../hooks/useMobile';
import Search from './Search';
import UserMenu from './UserMenu';
import logo from '../assets/logo.png';
import isAdmin from '../utils/roles/isAdmin'
import isEndUser from '../utils/roles/isEndUser'
import isProfessional from '../utils/roles/isProfessional'
import { IoCubeOutline } from 'react-icons/io5';
import { FaPlusCircle } from 'react-icons/fa';


const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(state => state?.user);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path;
  const redirectToLoginPage = () => navigate("/login");
  const handleMobileUser = () => user?._id ? navigate("/dashboard") : navigate("/login");
  const handleLogoClick = () => user?._id ? navigate("/dashboard") : navigate("/");

  return (
    <>
      {/* Desktop Header */}
      {!user?._id ? (
        // Unauthenticated Desktop Header (original layout) C7E4FE FCDA98
        <header className="hidden md:block fixed top-0 left-0 w-full bg-white  z-40 border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-12 items-center gap-4">
              {/* Logo - Column 1 */}
              <div className="col-span-2">
                <Link to="/">
                  <img src={logo} alt="Logo" className="h-8" />
                </Link>
              </div>


              {/* Navigation + User - Column 3 */}
              <div className="col-span-8 flex justify-end items-center">
                <nav className="flex space-x-6 mr-6">
                  <Link
                    to="/"
                    className={`text-sm font-medium ${isActive("/") ? "text-[#30459D]" : "text-gray-800 hover:text-[#30459D]"}`}
                  >
                    Home
                  </Link>
                  
                  <Link
                    to="/drops"
                    className={`text-sm font-medium ${isActive("/drops") ? "text-[#30459D]" : "text-gray-800 hover:text-[#30459D]"}`}
                  >
                    Soro Drops
                  </Link>
                  <Link
                    to="/echoes"
                    className={`text-sm font-medium ${isActive("/echoes") ? "text-[#30459D]" : "text-gray-800 hover:text-[#30459D]"}`}
                  >
                    Soro Echoes
                  </Link>
                  <Link
                    to="about"
                    className={`text-sm font-medium ${isActive("/about") ? "text-[#30459D]" : "text-gray-800 hover:text-[#30459D]"}`}
                  >
                    About
                  </Link>
                  <Link
                    to="/support"
                    className={`text-sm font-medium ${isActive("/support") ? "text-[#30459D]" : "text-gray-800 hover:text-[#30459D]"}`}
                  >
                    Support
                  </Link>
                </nav>
              </div>
              <div className="col-span-2 flex justify-end space-x-4 items-center">

                  <button
                    onClick={redirectToLoginPage}
                    className="bg-[#30459D] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#001f63] transition-colors duration-300  flex items-center gap-1"
                  >
                    <span>Book Session</span>
                    <CalendarCheck2 size={16} />
                  </button>
                </div>
            </div>
          </div>
        </header>
      ) : (
        // Authenticated Desktop Header (dashboard layout)
        <>
          {/* Top Navigation Bar */}
   
          <header className="hidden md:block fixed top-0 left-0 w-full bg-white  z-40 border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-12 items-center gap-4">
              {/* Logo - Column 1 */}
              <div className="col-span-2">
                <Link to="/dashboard">
                  <img src={logo} alt="Logo" className="h-8" />
                </Link>
              </div>

              <div className="col-span-5">
                <div className="w-full max-w-md mx-auto">
                </div>
              </div>

              {/* Navigation + User - Column 3 */}
              <div className="col-span-5 flex justify-end space-x-4 items-center">
              <button 
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="relative flex items-center"
              >
                <div className="relative bg-[#30459D] hover:bg-blue-900 text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-50">
                <UserIcon size={18} />
                </div>
                <ChevronDown size={18} className={`ml-1 transition-transform ${openUserMenu ? '' : 'rotate-180'}`} />
                {openUserMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded shadow-lg p-2 min-w-48 border border-gray-200 z-50">
                    <UserMenu close={() => setOpenUserMenu(false)} />
                  </div>
                )}
              </button>
              </div>
            </div>
          </div>
        </header>

          {/* Sidebar */}
          <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-30 p-4">
            <nav className="space-y-1">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  isActive("/dashboard") 
                    ? "bg-[#30459D] text-[#fff]" 
                    : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                }`}
              >
                <Home size={20} />
                <span className="text-sm font-medium">Overview</span>
              </Link>
              {
                isAdmin(user.role) && (
                  <Link
                    to="/admin/posts"
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive("/admin/posts") 
                        ? "bg-[#30459D] text-[#fff]" 
                        : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                    }`}
                  >
                    <Store size={20} />
                    <span className="text-sm font-medium">Posts</span>
                  </Link>
                )
              }
              {
                isAdmin(user.role) && (
                  <Link
                    to="/admin/users"
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive("/admin/users") 
                        ? "bg-[#30459D] text-[#fff]" 
                        : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                    }`}
                  >
                    <Store size={20} />
                    <span className="text-sm font-medium">User Management</span>
                  </Link>
                )
              }
             
              {
                isAdmin(user.role) && (
                  <Link
                    to="/admin/bookings"
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive("/admin/bookings") 
                        ? "bg-[#30459D] text-[#fff]" 
                        : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                    }`}
                  >
                    <ClipboardList size={20} />
                    <span className="text-sm font-medium">Bookings</span>
                  </Link>
                )
              }
             
              
              {
                isProfessional(user.role) && (
                  <Link
                    to="/availability"
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive("/availability") 
                        ? "bg-[#30459D] text-[#fff]" 
                        : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                    }`}
                  >
                    <CalendarCheck2 size={20} />
                    <span className="text-sm font-medium">Availability</span>
                  </Link>
                )
              }
                         
              {
                isEndUser(user.role) && (
                  <Link
                    to="/safespace"
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive("/safespace") 
                        ? "bg-[#30459D] text-[#fff]" 
                        : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                    }`}
                  >
                    <MessageCircleHeart size={20} />
                    <span className="text-sm font-medium">SafeSpace</span>
                  </Link>
                )
              }

              <Link
                to="/bookings"
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  isActive("/bookings") 
                    ? "bg-[#30459D] text-[#fff]" 
                    : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                }`}
              >
                <ClipboardList size={20} />
                <span className="text-sm font-medium">Bookings</span>
              </Link>

              {
                isEndUser(user.role) && (
                  <Link
                    to="/drops"
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive("/drops") 
                        ? "bg-[#30459D] text-[#fff]" 
                        : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                    }`}
                  >
                    <Users size={20} />
                    <span className="text-sm font-medium">Soro drops</span>
                  </Link>
                )
              }
              
              
              <Link
                to="/account"
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  isActive("/account") 
                    ? "bg-[#30459D] text-[#fff]" 
                    : "text-gray-600 hover:bg-[#30459D]/10 hover:text-[#30459D]"
                }`}
              >
                <Users size={20} />
                <span className="text-sm font-medium">Account</span>
              </Link>


              {
                isAdmin(user.role) && (
                  <div className="border-t pt-4">
                  <button
                    
                    className="w-full flex items-center mt-20  space-x-3 p-3 rounded-lg border border-dashed border-[#30459D] text-[#30459D] hover:bg-[#30459D]/10"
                  >
                    <Plus size={20} />
                    <span className="text-sm font-medium">Upload Post</span>
                  </button>
                </div>
                )
              }
            </nav>
          </aside>
        </>
      )}

      {/* Mobile Header (same for both authenticated/unauthenticated) */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-white px-2 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Only shown when NOT authenticated */}
          
          <Link to="/" className="w-18 ">
            <img src={logo} alt="Logo" className="h-7" />
          </Link>


          {user?._id ? (
            <div className="flex-1 px-1 mx-1 min-w-0">
            </div>
          ) : (
            <div className="flex-1"></div>
          )}

          {/* User Icons */}
          <div className="w-16 flex justify-end">
            {user?._id ? (
              <div className="flex space-x-3">
                <button 
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="relative flex items-center"
              >
                <div className="relative bg-[#30459D] hover:bg-blue-900 text-white p-3 rounded-full shadow-lg transition-colors duration-200 z-50">
                <UserIcon size={16} />
                </div>
                {openUserMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded shadow-lg p-2 min-w-48 border border-gray-200 z-50">
                    <UserMenu close={() => setOpenUserMenu(false)} />
                  </div>
                )}
              </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#30459D] text-white px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1 whitespace-nowrap"
              >
                <span>Book Session</span>
                <CalendarCheck2 size={14} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {!user?._id ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-1">
          <Link
            to={user?._id ? "/dashboard" : "/"}
            className={`flex flex-col items-center p-1 ${isActive("/") || (user?._id && isActive("/dashboard")) ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          <Link
            to="/drops"
            className={`flex flex-col items-center p-1 ${isActive("/drops") ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <Sparkles size={20} />
            <span className="text-[10px] mt-0.5">Soro drops</span>
          </Link>
          <Link
            to="/echoes"
            className={`flex flex-col items-center p-1 ${isActive("/echoes") ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <Wifi size={20} />
            <span className="text-[10px] mt-0.5">Soro Echoes</span>
          </Link>

          <Link
            to="/about"
            className={`flex flex-col items-center p-1 ${isActive("/about") ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <BookHeart size={20} />
            <span className="text-[10px] mt-0.5">About</span>
          </Link>

          <Link
            to="/support"
            className={`flex flex-col items-center p-1 ${isActive("/support") ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <PhoneCall size={20} />
            <span className="text-[10px] mt-0.5">Support</span>
          </Link>
  
        </div>
      </nav>
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-1">
          <Link
            to={user?._id ? "/dashboard" : "/"}
            className={`flex flex-col items-center p-1 ${isActive("/") || (user?._id && isActive("/dashboard")) ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>
          {
            isProfessional(user.role) && (
              <Link
                to="/availability"
                className={`flex flex-col items-center p-1 ${isActive("/availability") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <CalendarCheck2 size={20} />
                <span className="text-[10px] mt-0.5">Availability</span>
              </Link>
            )
          }
          {
            isAdmin(user.role) && (
              <Link
                to="/admin/posts"
                className={`flex flex-col items-center p-1 ${isActive("/admin/posts") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <Store size={20} />
                <span className="text-[10px] mt-0.5">Posts</span>
              </Link>
            )
          }
          {
            isAdmin(user.role) && (
              <Link
                to="/admin/create"
                className={`flex flex-col items-center p-1 ${isActive("/admin/create") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <FaPlusCircle size={22} className='text-[#30459D]' />
                <span className="text-[10px] mt-0.5">Add Post</span>
              </Link>
            )
          }
          {
            isAdmin(user.role) && (
              <Link
                to="/admin/users"
                className={`flex flex-col items-center p-1 ${isActive("/admin/users") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <Users size={20} />
                <span className="text-[10px] mt-0.5">Users</span>
              </Link>
            )
          }
          {
            isAdmin(user.role) && (
              <Link
                to="/admin/bookings"
                className={`flex flex-col items-center p-1 ${isActive("/admin/bookings") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <ClipboardList size={20} />
                <span className="text-[10px] mt-0.5">Bookings</span>
              </Link>
            )
          }
          {
            isEndUser(user.role) && (
              <Link
                to="/bookings"
                className={`flex flex-col items-center p-1 ${isActive("/bookings") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <ClipboardList size={20} />
                <span className="text-[10px] mt-0.5">Bookings</span>
              </Link>
            )
          }
          {
            isProfessional(user.role) && (
              <Link
                to="/bookings"
                className={`flex flex-col items-center p-1 ${isActive("/bookings") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <ClipboardList size={20} />
                <span className="text-[10px] mt-0.5">Bookings</span>
              </Link>
            )
          }
          

          {
            isEndUser(user.role) && (
              <Link
                to="/safespace"
                className={`flex flex-col items-center p-1 ${isActive("/safespace") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <MessageCircleHeart size={20} />
                <span className="text-[10px] mt-0.5">SafeSpace</span>
              </Link>
            )
          }
          {
            isEndUser(user.role) && (
              <Link
                to="/drops"
                className={`flex flex-col items-center p-1 ${isActive("/drops") ? "text-[#30459D]" : "text-gray-800"}`}
              >
                <Sparkles size={20} />
                <span className="text-[10px] mt-0.5">Soro drops</span>
              </Link>
            )
          }

          <Link
            to="/account"
            className={`flex flex-col items-center p-1 ${isActive("/account") ? "text-[#30459D]" : "text-gray-800"}`}
          >
            <UserIcon size={20} />
            <span className="text-[10px] mt-0.5">Account</span>
          </Link>
  
        </div>
      </nav>
      )}
      

      {/* Spacer for main content */}
      <div className={`h-14 md:h-16 ${user?._id ? 'md:ml-64' : ''}`}></div>
    </>
  );
};

export default Header;