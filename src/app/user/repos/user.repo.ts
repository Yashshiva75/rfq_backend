// Import Config
import knex from "../../../config/database";
import config from "../../../config/constant";
import i18n from "../../../config/i18n";
import prisma from "../../../library/prisma.library";

// Import Interface
import GUID from "../../../interface/GUIDInterface";
import {
  UserInterface,
  CreateUserInput,
  UpdateUserInput,
} from "../../../interface/UserInterface";

// Import Thirdparty
import { StatusCodes } from "http-status-codes";
import moment from "moment";
import userRoleRepo from "../../user_role/repos/userRole.repo";
import bcrypt from "bcrypt";

class UserRepo {
  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get user by Email 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email.trim(),
            mode: "insensitive",
          },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get user by ID 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getUserById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Create new User 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async createUser(data: CreateUserInput) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          roleId: data.roleId,
        },
        include: {
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Update user details 
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async updateUserDetails(id: number, data: UpdateUserInput) {
    try {
      const updatePayload: any = { ...data };

      if (data.email) {
        updatePayload.email = data.email.toLowerCase().trim();
      }

      if (data.password) {
        updatePayload.password = await bcrypt.hash(data.password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updatePayload,
        include: {
          role: true,
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Update user password
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async updateUserPassword(id: number, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          updatedAt: moment.utc().toDate(),
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Check if email exists
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    try {
      const whereClause: any = {
        email: {
          equals: email.trim(),
          mode: "insensitive",
        },
      };

      if (excludeUserId) {
        whereClause.id = { not: excludeUserId };
      }

      const count = await prisma.user.count({
        where: whereClause,
      });

      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get all users list
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getAllUsers(filters: any = {}, pagination?: { page?: number; perPage?: number }) {
    try {
      const page = pagination?.page || 1;
      const perPage = pagination?.perPage || config.app.PER_PAGE || 10;
      const skip = (page - 1) * perPage;

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: filters,
          include: {
            role: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: pagination ? skip : undefined,
          take: pagination ? perPage : undefined,
        }),
        prisma.user.count({
          where: filters,
        }),
      ]);

      return {
        users,
        totalCount,
        page,
        perPage,
      };
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Delete user by ID
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async deleteUser(id: number) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  /*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
  🔱: @author : Yash shiva
  ✨: @uses : Get User Role Details
  👑: @created : 14/10/2026
  ✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/
  async getUserRole(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          roleId: true,
          role: true,
        },
      });

      if (!user) return null;

      if (user.roleId) {
        return await userRoleRepo.getRoleById(user.roleId);
      }

      return user.role;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserRepo();
