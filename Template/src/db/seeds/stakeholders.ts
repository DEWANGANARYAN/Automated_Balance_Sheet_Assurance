import { db } from '@/db';
import { stakeholders } from '@/db/schema';

async function main() {
    const sampleStakeholders = [
        // Makers (8 stakeholders)
        {
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'maker',
            department: 'Finance',
            entities: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'maker',
            department: 'Finance',
            entities: JSON.stringify([8, 9, 10, 11, 12, 13]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-03-10').toISOString(),
        },
        {
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            role: 'maker',
            department: 'Finance',
            entities: JSON.stringify([14, 15, 16, 17, 18, 19, 20]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@company.com',
            role: 'maker',
            department: 'Operations',
            entities: JSON.stringify([21, 22, 23, 24, 25, 26]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-04-05').toISOString(),
        },
        {
            name: 'David Kim',
            email: 'david.kim@company.com',
            role: 'maker',
            department: 'Finance',
            entities: JSON.stringify([27, 28, 29, 30, 31]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-05-12').toISOString(),
        },
        {
            name: 'Lisa Anderson',
            email: 'lisa.anderson@company.com',
            role: 'maker',
            department: 'Operations',
            entities: JSON.stringify([32, 33, 34, 35, 36, 37, 38]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-03-25').toISOString(),
        },
        {
            name: 'Robert Taylor',
            email: 'robert.taylor@company.com',
            role: 'maker',
            department: 'Finance',
            entities: JSON.stringify([39, 40, 41, 42, 43, 44]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-06-08').toISOString(),
        },
        {
            name: 'Jennifer Martinez',
            email: 'jennifer.martinez@company.com',
            role: 'maker',
            department: 'Sales',
            entities: JSON.stringify([45, 46, 47, 48, 49, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-02-28').toISOString(),
        },

        // Checkers (6 stakeholders)
        {
            name: 'William Thompson',
            email: 'william.thompson@company.com',
            role: 'checker',
            department: 'Finance',
            entities: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Maria Garcia',
            email: 'maria.garcia@company.com',
            role: 'checker',
            department: 'Finance',
            entities: JSON.stringify([13, 14, 15, 16, 17, 18, 19, 20, 21, 22]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-02-10').toISOString(),
        },
        {
            name: 'James Wilson',
            email: 'james.wilson@company.com',
            role: 'checker',
            department: 'Operations',
            entities: JSON.stringify([23, 24, 25, 26, 27, 28, 29, 30, 31]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-03-18').toISOString(),
        },
        {
            name: 'Patricia Lee',
            email: 'patricia.lee@company.com',
            role: 'checker',
            department: 'Finance',
            entities: JSON.stringify([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-04-22').toISOString(),
        },
        {
            name: 'Christopher Brown',
            email: 'christopher.brown@company.com',
            role: 'checker',
            department: 'IT',
            entities: JSON.stringify([43, 44, 45, 46, 47, 48, 49, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-05-30').toISOString(),
        },
        {
            name: 'Amanda Davis',
            email: 'amanda.davis@company.com',
            role: 'checker',
            department: 'Finance',
            entities: JSON.stringify([1, 8, 15, 22, 29, 36, 43, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-06-15').toISOString(),
        },

        // Approvers (4 stakeholders)
        {
            name: 'Daniel Miller',
            email: 'daniel.miller@company.com',
            role: 'approver',
            department: 'Finance',
            entities: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Elizabeth White',
            email: 'elizabeth.white@company.com',
            role: 'approver',
            department: 'Finance',
            entities: JSON.stringify([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            name: 'Matthew Harris',
            email: 'matthew.harris@company.com',
            role: 'approver',
            department: 'Operations',
            entities: JSON.stringify([31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-03-12').toISOString(),
        },
        {
            name: 'Jessica Moore',
            email: 'jessica.moore@company.com',
            role: 'approver',
            department: 'IT',
            entities: JSON.stringify([43, 44, 45, 46, 47, 48, 49, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-04-18').toISOString(),
        },

        // Admins (2 stakeholders)
        {
            name: 'Thomas Anderson',
            email: 'thomas.anderson@company.com',
            role: 'admin',
            department: 'IT',
            entities: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: true }),
            createdAt: new Date('2024-01-05').toISOString(),
        },
        {
            name: 'Michelle Clark',
            email: 'michelle.clark@company.com',
            role: 'admin',
            department: 'HR',
            entities: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: true }),
            createdAt: new Date('2024-01-08').toISOString(),
        },

        // Additional Sales stakeholder
        {
            name: 'Kevin Martinez',
            email: 'kevin.martinez@company.com',
            role: 'maker',
            department: 'Sales',
            entities: JSON.stringify([10, 20, 30, 40, 50]),
            notificationPreferences: JSON.stringify({ email: true, inApp: true, sms: false }),
            createdAt: new Date('2024-07-01').toISOString(),
        },
    ];

    await db.insert(stakeholders).values(sampleStakeholders);
    
    console.log('✅ Stakeholders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});