import mongoose from 'mongoose'

const connectDB = async() => {
    try {
        mongoose.connection.on('connected', () => console.log('Database connnected'))
        await mongoose.connect(`${process.env.MONGO_URI}/shared_working_platform`)
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDB