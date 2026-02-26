/**
 * Standalone seed script for production Docker container.
 * Run manually with: docker compose exec app node seed-admin.cjs
 *
 * Uses raw SQL via 'pg' — no Prisma client needed.
 * Idempotent — safe to run multiple times.
 */
const { Pool } = require("pg");
const { hash } = require("bcryptjs");
const { randomBytes } = require("crypto");

async function seedAdmin() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
        console.log(
            "Skipping seed: SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set"
        );
        return;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        // Check if super admin already exists
        const existing = await pool.query(
            'SELECT id FROM "User" WHERE email = $1',
            [email]
        );

        if (existing.rows.length > 0) {
            console.log("Super admin already exists:", email);
            return;
        }

        // Generate cuid-like ID
        const id = randomBytes(12).toString("hex");
        const hashedPassword = await hash(password, 12);
        const now = new Date().toISOString();

        await pool.query(
            `INSERT INTO "User" (id, email, name, password, role, "authProvider", "isActive", "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [id, email, "Super Admin", hashedPassword, "SUPER_ADMIN", "MANUAL", true, now, now, now]
        );

        console.log("Super admin created:", email);
    } catch (error) {
        console.error("Error seeding super admin:", error.message);
    } finally {
        await pool.end();
    }
}

seedAdmin();
