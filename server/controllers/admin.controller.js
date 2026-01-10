import PreAuthorizationModel from "../models/preAuthorization.model.js";
import UserModel from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import sendEmail from "../config/sendEmail.js";
import Availability from "../models/availability.model.js"; // Add this import


export async function preAuthorizeUserController(req, res) {
  try {
    const { email } = req.body;
    
    // Role check is already handled by your admin middleware
    // The middleware ensures only ADMIN/SUPERADMIN can access this route
    
    // Check if already pre-authorized
    const existingPreAuth = await PreAuthorizationModel.findOne({ email });
    if (existingPreAuth) {
      return res.status(409).json({
        message: "Email already pre-authorized",
        error: true,
        success: false,
      });
    }
    
    const preAuthData = {
      email,
      authorizedBy: req.userId
    };
    
    await PreAuthorizationModel.create(preAuthData);
    
    // Send email to the pre-authorized professional
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/><title>Welcome to Soro - Pre-Authorization Complete</title></head>
    <body style="font-family:Arial,sans-serif;background:#F4F6FA;margin:0;padding:10px;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="background:#F8FAFF;padding:20px;text-align:center;">
            <img src="https://res.cloudinary.com/dc6ndqxuz/image/upload/v1758374700/soro_czovt6.png"
              alt="Soro Logo" width="100" style="display:block;margin:0 auto 10px;"/>
            <h1 style="color:#888;font-size:24px;margin:0;">Welcome to Soro!</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#FFF;padding:25px;border:1px solid #E5E9F2;">
            <p style="font-size:16px;line-height:1.5;">
              Hi there,
            </p>
            <p style="font-size:16px;line-height:1.5;">
              Great news! Your email address <strong>${email}</strong> has been pre-authorized 
              to join Soro as a mental health professional.
            </p>
            <div style="background:#F8FAFF;padding:20px;border-radius:6px;margin:20px 0;">
              <h2 style="margin:0 0 10px;color:#2D8CFF;font-size:18px;">Next Steps</h2>
              <p style="margin:0;font-size:15px;">
                1. Complete your professional profile registration<br>
                2. Set your availability for clients<br>
                3. Start accepting booking requests
              </p>
            </div>
            <p style="text-align:center;margin:25px 0;">
              <a href="https://soro.care/register-professional"
                style="background:#2D8CFF;color:#FFF;text-decoration:none;
                       padding:12px 24px;border-radius:4px;font-weight:bold;">
                Complete Your Registration
              </a>
            </p>
            <p style="font-size:14px;color:#666;line-height:1.4;">
              You can now create your professional account using this email address. 
              If you have any questions, please contact our support team.
            </p>
            <p style="font-size:16px;line-height:1.5;margin-top:20px;">
              Welcome aboard!<br/>The Soro Team
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#FAFBFF;padding:15px;text-align:center;font-size:12px;color:#888;">
            © ${new Date().getFullYear()} Soro. All rights reserved.&nbsp;
            <a href="https://soro.care/support" style="color:#888;text-decoration:underline;">
              contact support
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Send the email (wrapped in try-catch to prevent email errors from affecting the main response)
    try {
      await sendEmail(
        email,
        "Welcome to Soro - Your Professional Account is Pre-Authorized",
        html
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the request if email fails, just log it
    }
    
    return res.status(201).json({
      message: "Professional pre-authorized successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Pre-authorization error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function getAdminDashboardStatsController(req, res) {
  try {
    const [
      totalUsers,
      totalProfessionals,
      totalBookings,
      pendingBookings,
      completedBookings,
      newUsersThisMonth,
      totalAvailableSlotsResult // Changed variable name to avoid conflict
    ] = await Promise.all([
      // Total Users (only USER role)
      UserModel.countDocuments({ role: 'USER' }),
      
      // Total Professionals
      UserModel.countDocuments({ role: 'PROFESSIONAL' }),
      
      // Total Bookings
      Booking.countDocuments(),
      
      // Pending Bookings
      Booking.countDocuments({ status: 'Pending' }),
      
      // Completed Bookings
      Booking.countDocuments({ status: 'Completed' }),
      
      // New Users This Month (both USER and PROFESSIONAL)
      UserModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      
      // Total Available Slots (count all slots across all professionals)
      Availability.aggregate([
        {
          $match: { available: true }
        },
        {
          $project: {
            slotCount: { $size: "$slots" }
          }
        },
        {
          $group: {
            _id: null,
            totalSlots: { $sum: "$slotCount" }
          }
        }
      ])
    ]);

    // Extract total slots from aggregation result
    const totalSlots = totalAvailableSlotsResult[0]?.totalSlots || 0;

    const stats = {
      users: {
        total: totalUsers, // Only USER role count
        professionals: totalProfessionals, // Only PROFESSIONAL role count
        newThisMonth: newUsersThisMonth // All new users this month
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings
      },
      slots: {
        total: totalSlots
      },
      platform: {
        utilizationRate: totalProfessionals > 0 ? Math.round((completedBookings / totalProfessionals) * 100) : 0
      }
    };

    return res.status(200).json({
      data: stats,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// ... rest of your admin controller functions
// 2. User Management - Get all users with filtering
export async function getAllUsersController(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { counselorId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await UserModel.find(query)
      .select('-password -refresh_token')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserModel.countDocuments(query);

    return res.status(200).json({
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 3. Update user status (Activate/Deactivate)
export async function updateUserStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Active, Inactive, or Suspended",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password -refresh_token');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: `User status updated to ${status} successfully`,
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 4. Update user details (Admin)
export async function updateUserDetailsAdminController(req, res) {
  try {
    const { id } = req.params;
    const { name, email, mobile, role, status, isPeerCounselor, specialization, qualifications, bio, yearsOfExperience } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (isPeerCounselor !== undefined) updateData.isPeerCounselor = isPeerCounselor;
    if (specialization) updateData.specialization = specialization;
    if (qualifications) updateData.qualifications = qualifications;
    if (bio) updateData.bio = bio;
    if (yearsOfExperience) updateData.yearsOfExperience = yearsOfExperience;

    const user = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refresh_token');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "User details updated successfully",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Update user details error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 5. Delete user
export async function deleteUserController(req, res) {
  try {
    const { id } = req.params;

    // Prevent deletion of own account
    if (id === req.userId) {
      return res.status(400).json({
        message: "Cannot delete your own account",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Optionally: Delete user's bookings, availability, etc.
    await Booking.deleteMany({ $or: [{ user: id }, { professional: id }] });

    return res.status(200).json({
      message: "User deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 6. Get all bookings
export async function getAllBookingsController(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      professionalId,
      userId,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by professional
    if (professionalId) {
      query.professional = professionalId;
    }

    // Filter by user
    if (userId) {
      query.user = userId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bookings = await Booking.find(query)
      .populate('user', 'name email userId avatar')
      .populate('professional', 'name email counselorId avatar specialization')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// 7. Update booking status
export async function updateBookingStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'].includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
        error: true,
        success: false,
      });
    }

    const updateData = { status };
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email userId')
      .populate('professional', 'name email counselorId');

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: `Booking status updated to ${status} successfully`,
      data: booking,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}
// controllers/admin.controller.js
export async function getPreauthorizedUsersController(req, res) {
  try {
    const preauthorizedUsers = await PreAuthorizationModel.find()
      .populate('authorizedBy', 'email name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json(preauthorizedUsers);
  } catch (error) {
    console.error("Error fetching preauthorized users:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function deletePreauthorizationController(req, res) {
  try {
    const { id } = req.params;
    
    const preauthorized = await PreAuthorizationModel.findById(id);
    if (!preauthorized) {
      return res.status(404).json({
        message: "Preauthorization not found",
        error: true,
        success: false,
      });
    }
    
    await PreAuthorizationModel.findByIdAndDelete(id);
    
    return res.status(200).json({
      message: "Preauthorization removed successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error deleting preauthorization:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}