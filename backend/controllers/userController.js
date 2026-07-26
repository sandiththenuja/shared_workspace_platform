import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup = async(req, res) => {
    const {name, email, password, bio} = req.body;

    try {
        if(!name || !email || !password || !bio){
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({ success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            bio
        });

        const token = generateToken(newUser._id);

        const userData = {
            _id: newUser._id,
            name: newUser.name,
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
            name: userData.name,
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

export const getUsers = async (req, res) => {
    try {
        // Get all users except the current user
        const userId = req.user._id;
        
        const users = await User.find({ _id: { $ne: userId } })
            .select('-password') // Exclude password field
            .populate('team', 'name') // Populate team name if needed
            .sort({ fullName: 1 }); // Sort by name

        // Get task counts for each user
        const usersWithCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({
                assignedTo: user._id,
                status: 'Pending'
            });
            const inProgressTasks = await Task.countDocuments({
                assignedTo: user._id,
                status: 'In Progress'
            });
            const completedTasks = await Task.countDocuments({
                assignedTo: user._id,
                status: 'Completed'
            });

            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        }));

        res.status(200).json({
            success: true,
            users: usersWithCounts,
            count: usersWithCounts.length
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get users'
        });
    }
};

// ===== GET USER BY ID =====
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id)
            .select('-password')
            .populate('team', 'name description');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get user'
        });
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
        const {profilePic, bio, name} = req.body;
        const userId = req.user._id;
        let updateUser;

        if(!profilePic){
            updateUser = await User.findByIdAndUpdate(userId, {bio, name}, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updateUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, name}, {new: true});
        }
        res.status(200).json({ success: true, user: updateUser });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};