import { Response, NextFunction } from 'express';
import asyncHandler from '../middleware/async';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Emails are matched regardless of case; accounts created before this may be stored with capitals.
const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, password, role } = req.body;
    const email = String(req.body.email).trim().toLowerCase();

    if (await User.exists({ email }).collation(CASE_INSENSITIVE)) {
        return next(new ErrorResponse('An account with this email already exists', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user (an exact match wins if two older accounts differ only by case)
    const normalizedEmail = String(email).trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password')
        ?? await User.findOne({ email: normalizedEmail }).collation(CASE_INSENSITIVE).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
