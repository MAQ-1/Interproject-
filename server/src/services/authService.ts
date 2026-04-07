import bcrypt from "bcrypt";
import { createHash, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/User.js";
import { config } from "../config.js";
import RefreshToken from "../models/RefreshToken.js";
import { ConflictError, UnauthorizedError, ValidationError } from "./errors.js";

// --- DEBUG LOGS ---
console.log("--- Auth System Initialization ---");
console.log("JWT Secret Loaded:", !!config.JWT_SECRET);
console.log("Refresh Secret Loaded:", !!config.JWT_REFRESH_SECRET);
console.log("----------------------------------");

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

const createAccessToken = (userId: string): string => {
  const expiresIn = config.JWT_ACCESS_EXPIRES_IN as any;
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn });
};

const createRefreshToken = (userId: string) => {
  const tokenId = randomUUID();
  const refreshExpiresIn = `${config.REFRESH_TOKEN_TTL_DAYS}d` as any;
  
  const refreshToken = jwt.sign(
    { userId, tokenId },
    config.JWT_REFRESH_SECRET,
    { expiresIn: refreshExpiresIn }
  );

  return {
    refreshToken,
    tokenId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  };
};

const persistRefreshToken = async (userId: string, tokenData: any) => {
  await RefreshToken.create({
    user: new Types.ObjectId(userId),
    tokenId: tokenData.tokenId,
    tokenHash: tokenData.tokenHash,
    expiresAt: tokenData.expiresAt,
  });
};

// --- EXPORTED FUNCTIONS ---

export const registerUser = async (email: string, password: string): Promise<AuthTokens> => {
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  
  return loginUser(email, password); 
};

export const loginUser = async (email: string, password: string): Promise<AuthTokens> => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ValidationError("Invalid credentials");
  }

  const userId = user._id.toString();
  const accessToken = createAccessToken(userId);
  const refreshTokenData = createRefreshToken(userId);

  await persistRefreshToken(userId, refreshTokenData);
  
  return { accessToken, refreshToken: refreshTokenData.refreshToken };
};

export const verifyAccessToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as { userId: string };
  } catch (error: any) {
    console.error("[Auth] Token verification failed:", error.message);
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.deleteOne({ tokenHash });
  console.log(`[Auth] Token revoked.`);
};

// Controller might call this 'logoutUser' or 'revokeRefreshToken'
export const logoutUser = revokeRefreshToken; 

export const rotateRefreshToken = async (refreshToken: string): Promise<AuthTokens> => {
    // Basic rotation logic
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
    const tokenHash = hashToken(refreshToken);
    
    const oldToken = await RefreshToken.findOne({ tokenHash });
    if (!oldToken) throw new UnauthorizedError("Invalid Refresh Token");

    await RefreshToken.deleteOne({ tokenHash });
    
    const accessToken = createAccessToken(decoded.userId);
    const newData = createRefreshToken(decoded.userId);
    await persistRefreshToken(decoded.userId, newData);

    return { accessToken, refreshToken: newData.refreshToken };
};