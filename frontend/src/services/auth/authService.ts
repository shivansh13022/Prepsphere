import api from "../api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function login(data: LoginData): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/login", data);
  return response.data;
}

export async function googleLogin(
  credential: string,
): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/google", {
    credential,
  });

  return response.data;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await api.post<User>("/users", data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export function isAuthenticated() {
  return !!getToken();
}