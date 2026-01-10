import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    userData: {
        type: Object,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }
});

const OTPModel = mongoose.model("OTP", otpSchema);

export default OTPModel;