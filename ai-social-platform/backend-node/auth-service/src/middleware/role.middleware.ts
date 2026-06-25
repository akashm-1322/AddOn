import { Request, Response, NextFunction } from 'express';

export function requireRole(role: string) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!user.roles || !user.roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
