import prisma from "@/config/prisma";
import bcrypt from "bcryptjs";
import { sendInviteMail } from "./mail.service";
import { createSystemLog } from "./log.service";
import { Role } from "@prisma/client";

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: "Active",
    createdAt: u.createdAt,
  }));

  return {
    statusCode: 200,
    success: true,
    data: formattedUsers,
  };
};

export const inviteUserService = async (
  email: string,
  role: string,
  actor?: { id: string; email: string; role: string }
) => {
  if (!email || !role) {
    return {
      statusCode: 400,
      success: false,
      message: "Email dan role wajib diisi",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const tempPassword = Math.random().toString(36).substring(2, 10);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  let user;
  const roleEnum = (role.toUpperCase() as Role) || Role.ADMIN;

  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        role: roleEnum,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } else {
    const defaultName = email.split("@")[0];
    user = await prisma.user.create({
      data: {
        name: defaultName,
        email,
        password: hashedPassword,
        role: roleEnum,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  await sendInviteMail(email, roleEnum, existingUser ? undefined : tempPassword);

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Mengundang User Baru: ${email} sebagai ${roleEnum}`,
      details: `User ID: ${user.id}`,
    });
  }

  return {
    statusCode: 201,
    success: true,
    message: `Undangan berhasil dikirim ke ${email}`,
    data: {
      ...user,
      status: "Active",
      temporaryPassword: existingUser ? undefined : tempPassword,
    },
  };
};

export const deleteUserService = async (
  id: string,
  actor?: { id: string; email: string; role: string }
) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User tidak ditemukan",
    };
  }

  await prisma.user.delete({
    where: { id },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Menghapus User: ${user.email} (${user.role})`,
      details: `User ID: ${user.id}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "User berhasil dihapus",
  };
};
