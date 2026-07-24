import prisma from "@/config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginInput, loginSchema } from "@/validations/auth.validation";
import { RegisterInput, registerSchema } from "@/validations/auth.validation";

export const registerService = async (
    payload: RegisterInput
  ) => {
  
    const validation = registerSchema.safeParse(payload);
  
    if (!validation.success) {
      return {
        statusCode: 400,
        success: false,
        message: validation.error.issues[0].message
      };
    }
  
    const { name, email, password } = validation.data;
  
    // cek email
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });
  
    if (existingUser) {
      return {
        statusCode: 409,
        success: false,
        message: "Email sudah digunakan"
      };
    }
  
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // simpan user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  
    return {
      statusCode: 201,
      success: true,
      message: "Register berhasil",
      data: user
    };
  
  };

  export const loginService = async (
    payload: LoginInput
  ) => {
  
    const validation = loginSchema.safeParse(payload);
  
    if (!validation.success) {
      return {
        statusCode: 400,
        success: false,
        message: validation.error.issues[0].message
      };
    }
  
    const { email, password } = validation.data;
  
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
  
    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: "Email atau password salah"
      };
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return {
        statusCode: 401,
        success: false,
        message: "Email atau password salah"
      };
    }
  
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d"
      }
    );
  
    return {
      statusCode: 200,
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
  };