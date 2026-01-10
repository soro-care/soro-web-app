import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  ageRange: {
    type: String,
    enum: ["Under 18", "18–21", "22–25", "26+"],
    required: true
  },
  gender: {
    type: String,
    enum: ["Female", "Male", "Prefer not to say"],
    required: true
  },
  concerns: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length <= 2;
      },
      message: "Please select no more than 2 concerns"
    }
  },
  otherConcern: String,
  diagnosed: {
    type: String,
    enum: ['Yes', 'No', 'Unsure'],
    required: true
  },
  diagnosisDetails: String
}, { timestamps: true });

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;