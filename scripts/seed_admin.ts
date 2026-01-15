
import { PrismaClient } from '../lib/generated/prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@iiits.ac.in'; // Use a valid domain based on existing validation
    const password = 'password123';
    const hashedPassword = await hash(password, 10);

    // Check if college exists for creating user relations? 
    // User model has collegeId which is ObjectId. 
    // I need to find an existing college or create one.

    let college = await prisma.college.findFirst();
    if (!college) {
        console.log('Creating default college for seeding...');
        college = await prisma.college.create({
            data: {
                tag: 'iiits',
                name: 'Indian Institute of Information Technology, Sri City',
                mediaLink: 'google.com',
                logoLink: 'google.com'
            }
        });
    }


    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    let user;
    if (!existingUser) {
        user = await prisma.user.create({
            data: {
                email,
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
                collegeId: college.id,
                isVerified: true
            },
        });
        console.log('Admin user created:', user);
    } else {
        // Optionally update role if exists but not admin
        if (existingUser.role !== 'ADMIN') {
            user = await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log('Existing user promoted to ADMIN:', user);
        } else {
            console.log('Admin user already exists.');
            user = existingUser;
        }
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
