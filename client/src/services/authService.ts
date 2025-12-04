import api from "./apiClient";
import { User } from "../types";

type LoginResponse = {
  token: string;
  user: User;
};

export const loginWithGoogle = async (credential: string) => {
  const { data } = await api.post<LoginResponse>("/auth/google", {
    credential,
  });
  console.log(data);

  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
};
