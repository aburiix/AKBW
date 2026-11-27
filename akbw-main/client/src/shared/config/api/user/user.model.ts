export interface IUser {
  id: string;
  phone: string;
  name: string;
  lastName: string;
  gender: string;
  profile_picture: string;
  createdAt: string;
  updatedAt: string;
  reviews?: any[];
  orders?: any[];
  referralCode?: string;
  birthDate?: string | null;
  region?: string | null;
  district?: string | null;
  email?: string | null;
}

export interface IUpdateUserRequest {
  name?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
  profile_picture?: string;
  birthDate?: string;
  region?: string;
  district?: string;
  email?: string;
}
