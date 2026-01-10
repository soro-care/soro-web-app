import mongoose from "mongoose";

const preAuthorizationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    authorizedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});


preAuthorizationSchema.index({ authorizedBy: 1 });

const PreAuthorizationModel = mongoose.model('PreAuthorization', preAuthorizationSchema);
export default PreAuthorizationModel;