/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : Database Seeder for Roles, Permissions & Test Users
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

import bcrypt from "bcrypt";
import prisma from "../src/library/prisma.library";

async function main() {
  console.log("Starting database seed...");

  // 1. Seed Roles
  const roles = ["admin", "buyer", "vendor", "user"];
  const roleMap: Record<string, any> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap[roleName] = role;
    console.log(`Role seeded: ${role.name} (id: ${role.id})`);
  }

  // 2. Seed Permissions
  const permissions = [
    "rfq:create",
    "rfq:read",
    "rfq:update",
    "rfq:delete",
    "quotation:create",
    "quotation:read",
    "quotation:update",
    "user:manage",
  ];

  for (const permName of permissions) {
    const perm = await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName },
    });

    // Assign all to admin
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleMap["admin"].id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: roleMap["admin"].id,
        permissionId: perm.id,
      },
    });
  }

  // 3. Seed Users
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const testUsers = [
    {
      name: "System Administrator",
      email: "admin@rfq.com",
      password: passwordHash,
      roleId: roleMap["admin"].id,
    },
    {
      name: "Procurement Buyer",
      email: "buyer@rfq.com",
      password: passwordHash,
      roleId: roleMap["buyer"].id,
    },
    {
      name: "Global Vendor Supplies",
      email: "vendor@rfq.com",
      password: passwordHash,
      roleId: roleMap["vendor"].id,
    },
  ];

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: u.password,
        roleId: u.roleId,
      },
      create: u,
    });
    console.log(`User seeded: ${user.email} (Role: ${user.roleId})`);
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
