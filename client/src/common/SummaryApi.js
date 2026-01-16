export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001'


const SummaryApi = {
    register : {
        url : '/api/user/register',
        method : 'post'
    },
    registerProfessional : {
        url : '/api/user/register-professional',
        method : 'post'
    },
    verifyOtp: {
        url: '/api/user/verify-otp',
        method: 'post'
    },
    resendOtp: {
        url: '/api/user/resend-otp',
        method: 'post'
    },
        changePassword: {
        url: '/api/user/change-password',
        method: 'put'
    },
    postSurvey : {
        url : '/api/survey/submit',
        method : 'post'
    },
    checkSurvey : {
        url : '/api/survey/status',
        method : 'get'
    },
    login : {
        url : '/api/user/login',
        method : 'post'
    },
    forgot_password : {
        url : "/api/user/forgot-password",
        method : 'put'
    },
    forgot_password_otp_verification : {
        url : 'api/user/verify-forgot-password-otp',
        method : 'put'
    },
    resetPassword : {
        url : "/api/user/reset-password",
        method : 'put'
    },
    refreshToken : {
        url : 'api/user/refresh-token',
        method : 'post'
    },
    userDetails : {
        url : '/api/user/user-details',
        method : "get"
    },
    logout : {
        url : "/api/user/logout",
        method : 'get'
    },
    uploadAvatar : {
        url : "/api/user/upload-avatar",
        method : 'put'
    },
    updateUserDetails : {
        url : '/api/user/update-user',
        method : 'put'
    },
     submitContact: {
        url : '/api/user/contact',
         method : 'post'
    },
    setAvailability: {
        url: '/api/consultation/availability',
        method: 'post'
    },
    getAvailability: {
        url: '/api/consultation/availability',
        method: 'get'
    },
    createBooking: {
        url: '/api/consultation/bookings',
        method: 'post'
    },
    getBookings: {
        url: '/api/booking',
        method: 'get'
    },
    updateBooking: {
        url: '/api/consultation/bookings',
        method: 'patch'
    },
    uploadImage : {
        url : '/api/file/upload',
        method : 'post'
    },
    createBlogPost: {
        url: '/api/blog/create',
        method: 'post'
    },
    getAllBlogs: {
        url: '/api/blog/get-all',
        method: 'GET'
    },
    getRecentBlogs: {
        url: '/api/blog/recent-posts',
        method: 'GET'
    },
    getAllBlogCategories: {
        url: '/api/blog/categories',
        method: 'get'
    },
    getBlog: {
        url: '/api/blog/get', 
    method: 'GET'
    },
    updateBlog: {
        url: '/api/blog/update',
        method: 'put'
    },
    deleteBlog: {
        url: '/api/blog/delete',
        method: 'delete'
    },
    addBlogComment: {
        url: '/api/blog/add-comment',
        method: 'post'
    },
    addCategory: {
        url: '/api/blog/create-category',
        method: 'post'
    },
    addComment: {
        url: '/api/blog/add-comment',
        method: 'post'
    },
        preauthorizeProfessional: {
        url: '/api/admin/preauthorize',
        method: 'post'
    },
    getPreauthorized: {
        url: '/api/admin/preauthorized',
        method: 'get'
    },
    deletePreauthorization: {
        url: '/api/admin/preauthorize',
        method: 'delete'
    },
    getAdminStats: {
        url: '/api/admin/dashboard/stats',
        method: 'get'
    },
     adminGetBookings: {
        url: '/api/admin/bookings',
        method: 'get'
    },
    adminUpdateBookingStatus: {
        url: '/api/admin/bookings',
        method: 'patch'
    },
    adminGetUsers: {
        url: '/api/admin/users',
        method: 'get'
    },
    adminUpdateUserStatus: {
        url: '/api/admin/users',
        method: 'patch'
    },
    adminDeleteUser: {
        url: '/api/admin/users',
        method: 'delete'
    },
    adminUpdateUserDetails: {
        url: '/api/admin/users',
        method: 'put'
    },
    createEcho: {
    url: '/api/echo/share',
    method: 'post'
    },
    getEchoesByRoom: {
        url: '/api/echo/room', // Will be appended with /:room
        method: 'get'
    },
    getEchoStats: {
        url: '/api/echo/stats',
        method: 'get'
    },
    searchEchoes: {
        url: '/api/echo/search',
        method: 'get'
    }
}

export default SummaryApi;