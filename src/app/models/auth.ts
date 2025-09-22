export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  name?: string;          // ← Added for full name from backend
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  points: number;
  rank: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  profilePicture?: string;
}

export interface ProfileDto {
  id: string;
  name?: string;
  profilePicture?: string;
}

export interface PointsResponseDto {
  points: number;
}

export interface RankResponseDto {
  rank: number;
}

export interface ResponseDto {
  message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface OtpRequest {
  email: string;
}

export interface OtpVerification {
  email: string;
  otp: string;
}
