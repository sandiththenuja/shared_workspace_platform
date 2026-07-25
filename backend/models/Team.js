import mongoose, { mongo } from "mongoose";

const teamSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String},
    coverImg: {type: String, default: ""},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    inviteCode: {type: String, unique: true, default: null},
    isPrivate: {type: Boolean, default: false}
}, {timestamps: true})

const Team = mongoose.model("Team", teamSchema)

export default Team

