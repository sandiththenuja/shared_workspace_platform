import mongoose, { mongo } from "mongoose";

const fileSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: '' },
    publicId: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
    description: { type: String, default: '' }
}, { _id: true });

const teamSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String},
    coverImg: {type: String, default: ""},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    inviteCode: {type: String, unique: true, default: "code123"},
    isPrivate: {type: Boolean, default: false},
    files: [fileSchema]
}, {timestamps: true})

const Team = mongoose.model("Team", teamSchema)

export default Team
