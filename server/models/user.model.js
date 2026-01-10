import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "provide password"]
    },
    avatar: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: null
    },
    refresh_token: {
        type: String,
        default: ""
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    last_login_date: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active"
    },
    forgot_password_otp: {
        type: String,
        default: null
    },
    forgot_password_expiry: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ["USER", "PROFESSIONAL", "ADMIN", "SUPERADMIN"],
        default: "USER"
    },
    isPeerCounselor: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        unique: true,
        default: null
    },
    counselorId: {
        type: String,
        unique: true,
        default: null
    },
    specialization: {
        type: String,
        default: ""
    },
    qualifications: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        default: ""
    },
    yearsOfExperience: {
        type: Number,
        default: 0
    },
    availability: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Availability'
    }]
}, {
    timestamps: true
});

// Generate counselor ID before saving
userSchema.pre('save', async function(next) {
    if (!this.userId) {
        let uniqueUserId;
        do {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            uniqueUserId = `SORO-${randomNum}`;
        } while (await this.constructor.findOne({ userId: uniqueUserId }));
        this.userId = uniqueUserId;
    }

    if (this.isPeerCounselor && !this.counselorId) {
        let uniqueCounselorId;
        do {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            uniqueCounselorId = `SC-${randomNum}`;
        } while (await this.constructor.findOne({ counselorId: uniqueCounselorId }));
        this.counselorId = uniqueCounselorId;
    }
    
    next();
});


const UserModel = mongoose.model("User", userSchema);

export default UserModel;