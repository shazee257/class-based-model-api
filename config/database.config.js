import mongoose from 'mongoose';
import colors from "colors";
import { asyncHandler } from '../utils/helpers.js';


const connectDB = asyncHandler(async () => {
    try {
        const DB_URI = `${process.env.MONGODB_URL}/${process.env.DB_NAME}`;
        const conn = await mongoose.connect(DB_URI);
        console.log(`MongoDB Connected -> : ${conn.connection.name}`.cyan.bold);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
});

export default connectDB;