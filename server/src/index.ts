import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db';
import errorHandler from './middleware/error';

// Route files
import auth from './routes/auth';
import quotations from './routes/quotations';
import templates from './routes/templates';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/quotations', quotations);
app.use('/api/v1/templates', templates);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, status: 'Healthy' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(
        `\x1b[36m[Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}\x1b[0m`
    );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any, promise) => {
    console.log(`\x1b[31m[Error] Unhandled Rejection: ${err.message}\x1b[0m`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
