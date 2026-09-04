import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, password, departamentoId, municipioId } = req.body;

    // Validate inputs
    if (!email || !password || !nombre || !apellido || !municipioId) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.authUser.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx: any) => {
      // 1. Create AuthUser
      const user = await tx.authUser.create({
        data: {
          email,
          passwordHash,
        },
      });

      // 2. Create Perfil (Link with the newly generated user ID)
      await tx.perfil.create({
        data: {
          id: user.id, // Using the same UUID from auth_users
          nombreCompleto: `${nombre} ${apellido}`,
          municipioId: Number(municipioId), 
        },
      });

      return user;
    });

    // Generate token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: newUser.id, email: newUser.email, nombreCompleto: `${nombre} ${apellido}`, verificado: false }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar el usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      return;
    }

    // Find user
    const user = await prisma.authUser.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Fetch profile separately since relation is not strictly defined in Prisma schema
    const perfil = await prisma.perfil.findUnique({
      where: { id: user.id },
      include: {
        municipio: {
          include: {
            departamento: true
          }
        }
      }
    });

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombreCompleto: perfil?.nombreCompleto || 'Usuario',
        municipio: perfil?.municipio?.nombre || 'Desconocido',
        departamento: perfil?.municipio?.departamento?.nombre || 'Desconocido',
        verificado: (perfil as any)?.verificado || false
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
  }
};
