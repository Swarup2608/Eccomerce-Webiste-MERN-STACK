import type { JwtPayload } from "jsonwebtoken";

interface AdminTokenPayload extends JwtPayload {
    id: string;
    role: "admin";
}

declare global {
    namespace Express {
        interface Request {
            admin?: AdminTokenPayload;
        }
    }
}

export {};
