import type { Request, Response, NextFunction } from "express";
interface AdminRequest extends Request {
    admin?: {
        id: string;
        role: string;
    };
}
export declare const protectAdmin: (req: AdminRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const restrictTo: (...roles: string[]) => (req: AdminRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map