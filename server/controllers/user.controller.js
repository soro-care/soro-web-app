import sendEmail from '../config/sendEmail.js';
import UserModel from '../models/user.model.js';
import OTPModel from '../models/otp.model.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';
import generateOTP from '../utils/generateOTP.js';
import uploadImageCloudinary from '../utils/uploadImageCloudinary.js';
import { generateRandomUsername } from '../utils/usernameGenerator.js';
import {
  userWelcomeTemplate,
  professionalWelcomeTemplate,
  otpTemplate,
  passwordResetTemplate,
  passwordResetConfirmationTemplate,
  passwordChangeConfirmationTemplate,
  contactFormTemplate
} from './emailTemplates.js';
import jwt from 'jsonwebtoken';
import PreAuthorizationModel from '../models/preAuthorization.model.js';

// const STUDENT_EMAIL_REGEX = /^[0-9]+-[0-9]+kc[0-9]+@students\.unilorin\.edu\.ng$/i;

// const STUDENT_EMAIL_REGEX = /^[0-9]{1,2}-[0-9]{1,2}(ka|kb|kc|lm|pt|pw)[0-9]+@students\.unilorin\.edu\.ng$/i;

const STUDENT_EMAIL_REGEX = /^[0-9]{1,2}-[0-9]{1,2}[a-z]{2}[0-9]+@students\.unilorin\.edu\.ng$/i;

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1) Validate student‐only email
    if (!STUDENT_EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Only accessible to students of University of Ilorin – please enter your student email.",
        error: true,
        success: false
      });
    }

    // 2) Basic fields check
    if (!name || !password) {
      return res.status(400).json({ 
        message: "Provide name, email, and password", 
        error: true, 
        success: false 
      });
    }

    // 3) Already registered?
    if (await UserModel.findOne({ email })) {
      return res.status(409).json({ 
        message: "Email already registered", 
        error: true, 
        success: false 
      });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Check if OTP already exists for this email
    const existingOtp = await OTPModel.findOne({ email });
    
    const otpData = {
      email,
      otp,
      expiry: otpExpiry,
      userData: {
        name,
        email,
        password
      }
    };

    if (existingOtp) {
      // Update existing OTP
      await OTPModel.findOneAndUpdate({ email }, otpData);
    } else {
      // Create new OTP
      await OTPModel.create(otpData);
    }

    // Send OTP email
    await sendEmail(
      email,
      "🔑 Your Soro Verification Code",
      otpTemplate({ name, otp })  // Pass as object
    );
    
    return res.json({
      message: "OTP sent to your email",
      error: false,
      success: true,
      nextStep: "verify-otp"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: error.message || "Internal server error", 
      error: true, 
      success: false 
    });
  }
}

export async function verifyOtpController(req, res) {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists in database
    const otpRecord = await OTPModel.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or invalid. Please request a new one.",
        error: true,
        success: false
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // Increment failed attempts
      await OTPModel.findOneAndUpdate(
        { email },
        { $inc: { attempts: 1 } }
      );
      
      // Check if too many attempts
      if (otpRecord.attempts >= 3) {
        await OTPModel.deleteOne({ email });
        return res.status(400).json({
          message: "Too many failed attempts. Please request a new OTP.",
          error: true,
          success: false
        });
      }
      
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiry) {
      await OTPModel.deleteOne({ email });
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
        error: true,
        success: false
      });
    }

    // Proceed with registration
    const { name, email: userEmail, password } = otpRecord.userData;

    // Hash & save
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const username = generateRandomUsername(name);
    
    const newUser = new UserModel({
      name,
      email: userEmail,
      password: hashPassword,
      username,
      verify_email: true // Mark email as verified
    });

    const savedUser = await newUser.save();

    // Remove OTP from database
    await OTPModel.deleteOne({ email });

    // Send welcome email
    await sendEmail(
      userEmail,
      "🎉 Welcome to Soro!",
      userWelcomeTemplate(name)
    );

    return res.json({
      message: "Account created successfully",
      error: false,
      success: true,
      data: savedUser
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

export async function resendOtpController(req, res) {
  try {
    const { email } = req.body;

    // Check if OTP record exists
    const otpRecord = await OTPModel.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        message: "No pending registration found for this email",
        error: true,
        success: false
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update OTP in database
    await OTPModel.findOneAndUpdate(
      { email },
      { 
        otp: newOtp,
        expiry: otpExpiry,
        attempts: 0 // Reset attempts
      }
    );

    // CORRECTED: Pass parameters as an object
    await sendEmail(
      email,
      "🔑 Your New Soro Verification Code",
      otpTemplate({
        name: otpRecord.userData.name,
        otp: newOtp
      })
    );

    return res.json({
      message: "New OTP sent to your email",
      error: false,
      success: true
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
}

export async function registerProfessionalController(req, res) {
  try {
    const { name, email, password, isPeerCounselor, specialization, qualifications, bio, yearsOfExperience } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required", 
        error: true, 
        success: false 
      });
    }
    
    // Check if email already registered
    if (await UserModel.findOne({ email })) {
      return res.status(409).json({
        message: "Email already registered", 
        error: true, 
        success: false 
      });
    }
    
    // Pre-authorization check - SIMPLIFIED
    const preAuthorized = await PreAuthorizationModel.findOne({ email });
    if (!preAuthorized) {
      return res.status(403).json({
        message: "Get authorization from an admin first", 
        error: true, 
        success: false 
      });
    }
    
    // Rest of the registration logic remains the same...
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const username = generateRandomUsername(name);
    
    const prof = new UserModel({
      name, 
      email, 
      password: hashPassword, 
      username,
      role: "PROFESSIONAL", // Hardcoded as PROFESSIONAL
      isPeerCounselor, 
      specialization, 
      qualifications, 
      bio, 
      yearsOfExperience
    });
    
    const saved = await prof.save();

    // Optional: Remove pre-authorization record after successful registration
    // await PreAuthorizationModel.deleteOne({ email });

    await sendEmail(
      email,
      "🎉 Welcome to Our Platform as a Professional!",
      professionalWelcomeTemplate({
        name,
        isPeerCounselor,
        counselorId: saved.counselorId
      })
    );

    res.status(201).json({
      message: "Professional registered successfully", 
      error: false, 
      success: true,
      data: {
        _id: saved._id, 
        name: saved.name, 
        email: saved.email,
        role: saved.role, 
        isPeerCounselor: saved.isPeerCounselor,
        counselorId: saved.counselorId, 
        specialization: saved.specialization
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: error.message, 
      error: true, 
      success: false 
    });
  }
}

// controllers/user.controller.js
export async function getAllProfessionals(req, res) {
  try {
    const professionals = await UserModel.find({ role: 'PROFESSIONAL' })
      .select('name email username avatar isPeerCounselor counselorId');
    
    // Anonymize peer counselors
    const anonymizedProfessionals = professionals.map(pro => {
      if (pro.isPeerCounselor) {
        return {
          _id: pro._id,
          counselorId: pro.counselorId,
          avatar: "", // Optional: use generic avatar
          isPeerCounselor: true,
          role: 'PROFESSIONAL',
          specialization: "Peer Counselor" // Or other generic field
        };
      }
      return pro;
    });

    return res.status(200).json({
      message: 'List of professionals',
      data: anonymizedProfessionals,
      success: true,
      error: false
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch professionals',
      error: error.message,
      success: false
    });
  }
}

export async function updateUsernameController(request, response) {
    try {
        const userId = request.userId; // from auth middleware
        const { username } = request.body;

        if (!username) {
            return response.status(400).json({
                message: "Username is required",
                error: true,
                success: false
            });
        }

        // Check if username is already taken by another user
        const existingUser = await UserModel.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
            return response.status(400).json({
                message: "Username already taken",
                error: true,
                success: false
            });
        }

        // Update username and set flag
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { 
                username,
                isUsernameSet: true 
            },
            { new: true }
        );

        return response.json({
            message: "Username updated successfully",
            error: false,
            success: true,
            data: updatedUser
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function verifyEmailController(request,response){
    try {
        const { code } = request.body

        const user = await UserModel.findOne({ _id : code})

        if(!user){
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({ _id : code },{
            verify_email : true
        })

        return response.json({
            message : "Verify email done",
            success : true,
            error : false
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : true
        })
    }
}

//login controller
export async function loginController(request,response){
    try {
        const { email , password } = request.body


        if(!email || !password){
            return response.status(400).json({
                message : "provide email, password",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "User not register",
                error : true,
                success : false
            })
        }

        if(user.status !== "Active"){
            return response.status(400).json({
                message : "Contact to Admin",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return response.status(400).json({
                message : "Check your password",
                error : true,
                success : false
            })
        }

        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await genertedRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.cookie('accessToken',accessToken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)

        return response.json({
            message : "Login successfully",
            error : false,
            success : true,
            data : {
                accessToken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//logout controller
export async function logoutController(request,response){
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//upload user avatar
export async  function uploadAvatar(request,response){
    try {
        const userId = request.userId
        const image = request.file

        const upload = await uploadImageCloudinary(image)
        
        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : upload.url
        })

        return response.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload.url
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId; // from auth middleware
        const { name, email, mobile, password, username } = request.body;

        let hashPassword = "";

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            hashPassword = await bcryptjs.hash(password, salt);
        }

        // If username is being updated, we need to check if it's available
        if (username) {
            const existingUser = await UserModel.findOne({ username });
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return response.status(400).json({
                    message: "Username already taken",
                    error: true,
                    success: false
                });
            }
        }

        const updateUser = await UserModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashPassword }),
            ...(username && { 
                username: username,
                isUsernameSet: true 
            })
        });

        return response.json({
            message: "Updated successfully",
            error: false,
            success: true,
            data: updateUser
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

//forgot password not login

export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body;

        // 1) Validate email exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.json({
                message: "If this email exists, we've sent a password reset link",
                error: false,
                success: true
            });
        }

        // 2) Generate OTP and set expiry (10 minutes)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // 3) Store OTP in user document
        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: otpExpiry
        });

        // 4) Send password reset email (using your preferred pattern)
        await sendEmail(
            email,
            "🔑 Your Soro Password Reset Code",
            passwordResetTemplate({ 
                name: user.name, 
                otp: otp 
            })
        );

        return response.json({
            message: "Password reset OTP sent to your email",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Password reset error:", error);
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}


//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;

        // 1) Basic validation
        if (!email || !otp) {
            return response.status(400).json({
                message: "Email and OTP are required",
                error: true,
                success: false
            });
        }

        // 2) Find user with valid OTP
        const user = await UserModel.findOne({ 
            email,
            forgot_password_otp: otp,
            forgot_password_expiry: { $gt: new Date() }
        });

        if (!user) {
            return response.status(400).json({
                message: "Invalid or expired OTP",
                error: true,
                success: false
            });
        }

        // 3) Generate temporary token for password reset
        const tempToken = jwt.sign(
            { userId: user._id, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // 4) Clear OTP fields
        await UserModel.findByIdAndUpdate(user._id, {
            $unset: {
                forgot_password_otp: 1,
                forgot_password_expiry: 1
            }
        });

        return response.json({
            message: "OTP verified successfully",
            error: false,
            success: true,
            tempToken
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//reset the password
export async function resetPassword(request, response) {
    try {
        const { tempToken, newPassword, confirmPassword } = request.body;

        // 1) Validate inputs
        if (!tempToken || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }

        // 2) Verify token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
            if (decoded.purpose !== 'password_reset') {
                throw new Error("Invalid token purpose");
            }
        } catch (error) {
            return response.status(401).json({
                message: "Invalid or expired token",
                error: true,
                success: false
            });
        }

        // 3) Check password match
        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "Passwords do not match",
                error: true,
                success: false
            });
        }

        // 4) Update password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        await UserModel.findByIdAndUpdate(decoded.userId, {
            password: hashedPassword
        });

        // 5) Send confirmation email (using your preferred pattern)
        const user = await UserModel.findById(decoded.userId);
        await sendEmail(
            user.email,
            "✅ Your Soro Password Has Been Reset",
            passwordResetConfirmationTemplate({ name: user.name })
        );

        return response.json({
            message: "Password updated successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Password reset error:", error);
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        // 1) Validate inputs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current and new password are required",
                error: true,
                success: false
            });
        }

        // 2) Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        // 3) Verify current password
        const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Current password is incorrect",
                error: true,
                success: false
            });
        }

        // 4) Hash new password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        // 5) Update password
        await UserModel.findByIdAndUpdate(userId, {
            password: hashedPassword
        });

        // 6) Send confirmation email (optional)
        await sendEmail(
            user.email,
            "🔒 Your Password Has Been Changed",
            passwordChangeConfirmationTemplate({ name: user.name })
        );

        return res.json({
            message: "Password updated successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Password change error:", error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};
//refresh token controler
export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.user?.id || request.userId; // Handle both cases
        
        if (!userId) {
            return response.status(401).json({
                message: 'Unauthorized',
                error: true,
                success: false
            });
        }

        const user = await UserModel.findById(userId)
            .select('-password -refresh_token')
       

        if (!user) {
            return response.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            });
        }

        return response.json({
            message: 'User details',
            data: user,
            error: false,
            success: true
        });
        
    } catch (error) {
        console.error('User details error:', error);
        return response.status(500).json({
            message: error.message || 'Something went wrong',
            error: true,
            success: false
        });
    }
}

// export const userDetails = async (req, res) => {
//     try {
//       const user = await UserModel.findById(req.user.id)
//         .select('-password')
//         .populate('progress');
        
//       res.json({
//         success: true,
//         data: user
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   };



export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await UserModel.findById(id);
		const currentUser = await UserModel.findById(req.userId);

		if (id === req.userId.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await UserModel.findByIdAndUpdate(id, { $pull: { followers: req.userId } });
			await UserModel.findByIdAndUpdate(req.userId, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await UserModel.findByIdAndUpdate(id, { $push: { followers: req.userId } });
			await UserModel.findByIdAndUpdate(req.userId, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.userId,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.userId;

		const usersFollowedByMe = await UserModel.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		// 1,2,3,4,5,6,
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export async function submitContactForm(req, res) {
  try {
    const { message } = req.body;
    let name, email;

    // Check for authenticated user
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        // Verify token and get user info
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded._id);
        
        if (!user) {
          return res.status(401).json({
            message: "User not found",
            error: true,
            success: false
          });
        }

        name = user.name;
        email = user.email;
      } catch (error) {
        console.error('Token verification error:', error);
        // Continue with unauthenticated flow if token is invalid
      }
    }

    // For non-authenticated users
    if (!name || !email) {
      ({ name, email } = req.body);
      
      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          message: "Name, email, and message are required",
          error: true,
          success: false
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Please enter a valid email address",
          error: true,
          success: false
        });
      }
    }

    // Email template for support team
    const supportEmailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>New Contact Form Submission - Soro Care</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">New Contact Form Submission</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hello Soro Team,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              You have received a new contact form submission from <strong>${name}</strong>.
            </p>
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Contact Details</h2>
              <table width="100%" style="border-collapse:collapse;font-size:15px;">
                <tr>
                  <td style="padding:8px 0;font-weight:bold;width:30%;">Name:</td>
                  <td style="padding:8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Email:</td>
                  <td style="padding:8px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">User Type:</td>
                  <td style="padding:8px 0;">${token ? 'Authenticated User' : 'Guest User'}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:bold;">Submitted:</td>
                  <td style="padding:8px 0;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">Message Content</h2>
              <p style="margin:0;font-size:15px;background:#FFF;padding:15px;border-radius:4px;border:1px solid #E5E9F2;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <p style="text-align:center;margin:25px 0;">
              <a href="mailto:${email}"
                style="background:#2D8CFF;color:#FFF;text-decoration:none;
                       padding:12px 24px;border-radius:4px;font-weight:bold;">
                Reply to ${name}
              </a>
            </p>
            <p style="font-size:14px;color:#666;line-height:1.4;">
              Please respond to this inquiry within 24 hours. This message was sent via the Soro Care contact form.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro Care. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Email template for user confirmation
    const userConfirmationHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Message Received - Soro Care</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#30459D;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#FFF;font-size:24px;margin:0;">Message Received!</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi ${name},
            </p>
            <p style="font-size:16px;line-height:1.5;">
              Thank you for reaching out to Soro Care! We've successfully received your message and our team is already looking into it.
            </p>
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#30459D;font-size:18px;">What Happens Next?</h2>
              <p style="margin:0;font-size:15px;">
                1. Our support team will review your message<br>
                2. You'll receive a personalized response within 24 hours<br>
                3. We'll work together to address your inquiry
              </p>
            </div>
            <div style="background:#F0F8FF;padding:15px;border-radius:6px;margin:20px 0;border-left:4px solid #2D8CFF;">
              <h3 style="margin:0 0 8px;color:#30459D;font-size:16px;">Your Message Summary</h3>
              <p style="margin:0;font-size:14px;color:#666;">
                ${message.length > 150 ? message.substring(0, 150) + '...' : message}
              </p>
            </div>
            <p style="font-size:14px;color:#666;line-height:1.4;">
              <strong>Reference ID:</strong> CT${Date.now().toString().slice(-6)}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
            <p style="text-align:center;margin:25px 0;">
              <a href="https://soro.care/support"
                style="background:#2D8CFF;color:#FFF;text-decoration:none;
                       padding:12px 24px;border-radius:4px;font-weight:bold;">
                Visit Support Center
              </a>
            </p>
            <p style="font-size:14px;color:#666;line-height:1.4;">
              If you have any additional questions or urgent concerns, feel free to reply directly to this email.
            </p>
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Warm regards,<br/>The Soro Care Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro Care. All rights reserved.&nbsp;
            <a href="https://soro.care" style="color:#888;text-decoration:underline;">
              Visit our website
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Send email to support team
    await sendEmail(
      'hello@soro.care',
      `New Contact Form Submission from ${name}`,
      supportEmailHtml
    );

    // Send confirmation email to user
    await (
      email,
      "We've Received Your Message - Soro Care",
      userConfirmationHtml
    );

    return res.json({
      message: "Your message has been sent successfully",
      error: false,
      success: true
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
      error: true,
      success: false
    });
  }
}