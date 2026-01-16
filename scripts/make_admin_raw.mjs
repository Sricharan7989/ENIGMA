
import { PrismaClient } from '../lib/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@iiits.ac.in';

    console.log(`Promoting ${email} to ADMIN using raw command...`);

    // Update command
    const cmd = {
        update: "User",
        updates: [
            {
                q: { email: email.toLowerCase() },
                u: { $set: { role: "ADMIN" } }
            }
        ]
    };

    try {
        const res = await prisma.$runCommandRaw(cmd);
        console.log("Update result:", JSON.stringify(res));
    } catch (e) {
        console.error("Failed to promote user:", e);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
