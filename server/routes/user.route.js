// server/routes/user.route.js

import { Router } from 'express'
import { forgotPasswordController, verifyOtpController, submitContactForm, resendOtpController, registerProfessionalController, getSuggestedUsers, followUnfollowUser,getAllProfessionals, loginController, logoutController, refreshToken, registerUserController, resetPassword, changePassword, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordOtp } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router()

userRouter.post('/register',registerUserController)
userRouter.post('/register-professional',registerProfessionalController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/verify-otp', verifyOtpController);
userRouter.post('/resend-otp', resendOtpController);
userRouter.post('/login',loginController)
userRouter.post('/contact', submitContactForm);
userRouter.get('/logout',auth,logoutController)
userRouter.get('/professionals', getAllProfessionals);
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.put('/change-password', auth, changePassword);
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetPassword)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails)
userRouter.get("/suggested", auth, getSuggestedUsers);
userRouter.post("/follow/:id", auth, followUnfollowUser);



export default userRouter