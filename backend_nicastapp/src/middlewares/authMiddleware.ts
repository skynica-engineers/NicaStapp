import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir al usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  // El header viene en formato "Bearer [token]"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Inyectar el usuario decodificado en la request para su uso en los controladores
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};
