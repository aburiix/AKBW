interface LoginRequest {
  phone: string;
  password?: string;
  verifyToken: string;
}

interface RegisterRequest {
  phone: string;
  name: string;
  gender: string;
  lastName: string;
  referralCode?: string;
  verifyToken: string;
}

export type { LoginRequest, RegisterRequest };
