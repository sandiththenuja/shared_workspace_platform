import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
    // ✅ Use 'id' field to match auth middleware
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
};