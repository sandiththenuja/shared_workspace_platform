import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup = async(req, res) => {
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio){
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({ success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, 
            email, 
            password: hashedPassword, 
            bio
        });

        // ✅ Generate token with user id
        const token = generateToken(newUser._id);

        // ✅ Send back user data (excluding password)
        const userData = {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            bio: newUser.bio,
            profilePic: newUser.profilePic || ""
        };

        res.status(201).json({ 
            success: true, 
            userData: userData, 
            token, 
            message: "Account created successfully" 
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async(req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email});
        
        if (!userData) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        const userResponse = {
            _id: userData._id,
            fullName: userData.fullName,
            email: userData.email,
            bio: userData.bio,
            profilePic: userData.profilePic || ""
        };

        res.status(200).json({ 
            success: true, 
            userData: userResponse, 
            token, 
            message: "Login success" 
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const checkAuth = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    res.status(200).json({ success: true, user: req.user });
};

export const updateProfile = async(req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body;
        const userId = req.user._id;
        let updateUser;

        if(!profilePic){
            updateUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updateUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.status(200).json({ success: true, user: updateUser });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};