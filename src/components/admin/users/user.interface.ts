export interface User {
    id: string;
    fname: string;
    lname: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    createdBy: {
      id: number;
      fname: string;
      lname: string;
    };
    verifiedAt: number;
    userType?: string;
    skill?: string;
    hourlyRate?: number;
    phone?: string;
    isAdmin?: boolean;
  }