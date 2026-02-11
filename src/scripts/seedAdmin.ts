import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
  try {
    const adminEmail = "superadmin@gmail.com";
    const adminPassword = "admin1234";
    const adminName = "Super Admin";

    // 1. Check if user exists (to avoid duplicate errors)
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("⚠️ User already exists. Checking role...");
      if (existingUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: UserRole.ADMIN },
        });
        console.log("✅ Existing user promoted to ADMIN.");
      }
      return;
    }

    // 2. CREATE: Sign up as a NORMAL user via the API
    // We REMOVE the 'role' field here so the API accepts it.
    console.log("Creating user via Auth API...");
    const response = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:7000",
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          // role: "ADMIN" <--- DELETED! This caused the 403
        }),
      },
    );

    // 3. ERROR HANDLING: Actually read the error message
    if (!response.ok) {
      const errorData = await response.json(); // <--- READ THE BODY
      throw new Error(
        `API Error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    console.log("✅ User created successfully!");

    // 4. PROMOTE: Use Prisma to upgrade them to Admin
    // This works because Prisma bypasses API security rules
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        emailVerified: true, // Optional: Auto-verify admins
      },
    });

    console.log(`🎉 Success! ${adminEmail} is now an ADMIN.`);
  } catch (error) {
    console.error("❌ Seed Failed:", error);
  }
}

seedAdmin();
