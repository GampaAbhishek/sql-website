import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createSession, getSessionByToken, getUserByEmail, createUser } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT tokens
export function generateTokens(user: User): { accessToken: string; refreshToken: string } {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthTokens> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  const tokens = generateTokens(user);
  
  // Save session to database
  await createSession(user.id, tokens.accessToken, tokens.refreshToken);

  // Remove password hash from user object
  const { password_hash, ...userWithoutPassword } = user;

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: userWithoutPassword
  };
}

// Register user
export async function registerUser(userData: {
  email: string;
  username: string;
  password: string;
  name: string;
  role?: string;
}): Promise<AuthTokens> {
  // Check if user already exists
  const existingUser = await getUserByEmail(userData.email);
  
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const password_hash = await hashPassword(userData.password);

  // Create user
  const newUser = await createUser({
    email: userData.email,
    username: userData.username,
    password_hash,
    name: userData.name,
    role: userData.role || 'student'
  });

  const tokens = generateTokens(newUser);
  
  // Save session to database
  await createSession(newUser.id, tokens.accessToken, tokens.refreshToken);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: newUser
  };
}

// Get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const session = await getSessionByToken(token);
    
    if (!session) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = session;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Middleware to verify authentication
export async function verifyAuth(request: Request): Promise<User> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const user = await getUserFromToken(token);

  if (!user) {
    throw new Error('Invalid token');
  }

  return user;
}

// Optional authentication (doesn't throw if no token)
export async function getOptionalAuth(request: Request): Promise<User | null> {
  try {
    return await verifyAuth(request);
  } catch {
    return null;
  }
}
