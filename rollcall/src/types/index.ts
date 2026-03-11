import { Role, AttendanceStatus } from "@prisma/client";

export type { Role, AttendanceStatus };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
