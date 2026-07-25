import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    password: {type: String, required: true, minlength: 6},
    profilePic: {type: String, default: ""},
    bio: {type: String},
    role: {type: String, enum: ["admin", "member"], default: "member"},
    team: [{type: mongoose.Schema.Types.ObjectId, ref: "Team"}]
}, {timestamps: true})

const User = mongoose.model("User", userSchema)

export default User