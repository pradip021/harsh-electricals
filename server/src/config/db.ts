import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/electrical-quotation');
        console.log(`\x1b[35m[Database] MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`\x1b[31m[Error] Database Connection Failed: ${error.message}\x1b[0m`);
        }
        process.exit(1);
    }
};

export default connectDB;
