import { db } from '@/db';
import { assignments } from '@/db/schema';

async function main() {
    const now = new Date();
    
    // Helper function to get date offset
    const getDateOffset = (days: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() + days);
        return date.toISOString();
    };

    const sampleAssignments = [
        // Entity 1 assignments
        {
            entityId: 1,
            stakeholderId: 1,
            roleType: 'uploader',
            dueDate: getDateOffset(15),
            status: 'pending',
            assignedAt: getDateOffset(-45),
            completedAt: null,
        },
        {
            entityId: 1,
            stakeholderId: 9,
            roleType: 'reviewer',
            dueDate: getDateOffset(-35),
            status: 'completed',
            assignedAt: getDateOffset(-50),
            completedAt: getDateOffset(-32),
        },
        {
            entityId: 1,
            stakeholderId: 15,
            roleType: 'approver',
            dueDate: getDateOffset(-25),
            status: 'completed',
            assignedAt: getDateOffset(-40),
            completedAt: getDateOffset(-22),
        },
        {
            entityId: 1,
            stakeholderId: 10,
            roleType: 'reviewer',
            dueDate: getDateOffset(-5),
            status: 'overdue',
            assignedAt: getDateOffset(-20),
            completedAt: null,
        },

        // Entity 2 assignments
        {
            entityId: 2,
            stakeholderId: 2,
            roleType: 'uploader',
            dueDate: getDateOffset(-40),
            status: 'completed',
            assignedAt: getDateOffset(-55),
            completedAt: getDateOffset(-38),
        },
        {
            entityId: 2,
            stakeholderId: 11,
            roleType: 'reviewer',
            dueDate: getDateOffset(20),
            status: 'pending',
            assignedAt: getDateOffset(-30),
            completedAt: null,
        },
        {
            entityId: 2,
            stakeholderId: 16,
            roleType: 'approver',
            dueDate: getDateOffset(-8),
            status: 'overdue',
            assignedAt: getDateOffset(-25),
            completedAt: null,
        },
        {
            entityId: 2,
            stakeholderId: 3,
            roleType: 'uploader',
            dueDate: getDateOffset(-45),
            status: 'completed',
            assignedAt: getDateOffset(-60),
            completedAt: getDateOffset(-42),
        },

        // Entity 3 assignments
        {
            entityId: 3,
            stakeholderId: 4,
            roleType: 'uploader',
            dueDate: getDateOffset(25),
            status: 'pending',
            assignedAt: getDateOffset(-20),
            completedAt: null,
        },
        {
            entityId: 3,
            stakeholderId: 12,
            roleType: 'reviewer',
            dueDate: getDateOffset(-30),
            status: 'completed',
            assignedAt: getDateOffset(-45),
            completedAt: getDateOffset(-28),
        },
        {
            entityId: 3,
            stakeholderId: 17,
            roleType: 'approver',
            dueDate: getDateOffset(-50),
            status: 'completed',
            assignedAt: getDateOffset(-58),
            completedAt: getDateOffset(-48),
        },
        {
            entityId: 3,
            stakeholderId: 13,
            roleType: 'reviewer',
            dueDate: getDateOffset(-3),
            status: 'overdue',
            assignedAt: getDateOffset(-18),
            completedAt: null,
        },

        // Entity 4 assignments
        {
            entityId: 4,
            stakeholderId: 5,
            roleType: 'uploader',
            dueDate: getDateOffset(-35),
            status: 'completed',
            assignedAt: getDateOffset(-48),
            completedAt: getDateOffset(-33),
        },
        {
            entityId: 4,
            stakeholderId: 9,
            roleType: 'reviewer',
            dueDate: getDateOffset(-42),
            status: 'completed',
            assignedAt: getDateOffset(-52),
            completedAt: getDateOffset(-40),
        },
        {
            entityId: 4,
            stakeholderId: 18,
            roleType: 'approver',
            dueDate: getDateOffset(10),
            status: 'pending',
            assignedAt: getDateOffset(-35),
            completedAt: null,
        },
        {
            entityId: 4,
            stakeholderId: 6,
            roleType: 'uploader',
            dueDate: getDateOffset(-10),
            status: 'overdue',
            assignedAt: getDateOffset(-22),
            completedAt: null,
        },

        // Entity 5 assignments
        {
            entityId: 5,
            stakeholderId: 7,
            roleType: 'uploader',
            dueDate: getDateOffset(18),
            status: 'pending',
            assignedAt: getDateOffset(-25),
            completedAt: null,
        },
        {
            entityId: 5,
            stakeholderId: 14,
            roleType: 'reviewer',
            dueDate: getDateOffset(-38),
            status: 'completed',
            assignedAt: getDateOffset(-50),
            completedAt: getDateOffset(-36),
        },
        {
            entityId: 5,
            stakeholderId: 15,
            roleType: 'approver',
            dueDate: getDateOffset(-28),
            status: 'completed',
            assignedAt: getDateOffset(-42),
            completedAt: getDateOffset(-26),
        },
        {
            entityId: 5,
            stakeholderId: 10,
            roleType: 'reviewer',
            dueDate: getDateOffset(12),
            status: 'pending',
            assignedAt: getDateOffset(-30),
            completedAt: null,
        },

        // Entity 6 assignments
        {
            entityId: 6,
            stakeholderId: 8,
            roleType: 'uploader',
            dueDate: getDateOffset(-44),
            status: 'completed',
            assignedAt: getDateOffset(-56),
            completedAt: getDateOffset(-41),
        },
        {
            entityId: 6,
            stakeholderId: 11,
            roleType: 'reviewer',
            dueDate: getDateOffset(-12),
            status: 'overdue',
            assignedAt: getDateOffset(-28),
            completedAt: null,
        },
        {
            entityId: 6,
            stakeholderId: 16,
            roleType: 'approver',
            dueDate: getDateOffset(-48),
            status: 'completed',
            assignedAt: getDateOffset(-60),
            completedAt: getDateOffset(-46),
        },
        {
            entityId: 6,
            stakeholderId: 1,
            roleType: 'uploader',
            dueDate: getDateOffset(22),
            status: 'pending',
            assignedAt: getDateOffset(-15),
            completedAt: null,
        },

        // Entity 7 assignments
        {
            entityId: 7,
            stakeholderId: 2,
            roleType: 'uploader',
            dueDate: getDateOffset(-32),
            status: 'completed',
            assignedAt: getDateOffset(-46),
            completedAt: getDateOffset(-30),
        },
        {
            entityId: 7,
            stakeholderId: 12,
            roleType: 'reviewer',
            dueDate: getDateOffset(28),
            status: 'pending',
            assignedAt: getDateOffset(-18),
            completedAt: null,
        },
        {
            entityId: 7,
            stakeholderId: 17,
            roleType: 'approver',
            dueDate: getDateOffset(-52),
            status: 'completed',
            assignedAt: getDateOffset(-58),
            completedAt: getDateOffset(-50),
        },
        {
            entityId: 7,
            stakeholderId: 13,
            roleType: 'reviewer',
            dueDate: getDateOffset(-2),
            status: 'overdue',
            assignedAt: getDateOffset(-15),
            completedAt: null,
        },

        // Entity 8 assignments
        {
            entityId: 8,
            stakeholderId: 3,
            roleType: 'uploader',
            dueDate: getDateOffset(8),
            status: 'pending',
            assignedAt: getDateOffset(-28),
            completedAt: null,
        },
        {
            entityId: 8,
            stakeholderId: 9,
            roleType: 'reviewer',
            dueDate: getDateOffset(-36),
            status: 'completed',
            assignedAt: getDateOffset(-48),
            completedAt: getDateOffset(-34),
        },
        {
            entityId: 8,
            stakeholderId: 18,
            roleType: 'approver',
            dueDate: getDateOffset(-7),
            status: 'overdue',
            assignedAt: getDateOffset(-20),
            completedAt: null,
        },
        {
            entityId: 8,
            stakeholderId: 14,
            roleType: 'reviewer',
            dueDate: getDateOffset(-40),
            status: 'completed',
            assignedAt: getDateOffset(-54),
            completedAt: getDateOffset(-38),
        },

        // Entity 9 assignments
        {
            entityId: 9,
            stakeholderId: 4,
            roleType: 'uploader',
            dueDate: getDateOffset(-46),
            status: 'completed',
            assignedAt: getDateOffset(-58),
            completedAt: getDateOffset(-44),
        },
        {
            entityId: 9,
            stakeholderId: 10,
            roleType: 'reviewer',
            dueDate: getDateOffset(-34),
            status: 'completed',
            assignedAt: getDateOffset(-44),
            completedAt: getDateOffset(-32),
        },
        {
            entityId: 9,
            stakeholderId: 15,
            roleType: 'approver',
            dueDate: getDateOffset(30),
            status: 'pending',
            assignedAt: getDateOffset(-12),
            completedAt: null,
        },
        {
            entityId: 9,
            stakeholderId: 5,
            roleType: 'uploader',
            dueDate: getDateOffset(-1),
            status: 'overdue',
            assignedAt: getDateOffset(-16),
            completedAt: null,
        },

        // Entity 10 assignments
        {
            entityId: 10,
            stakeholderId: 6,
            roleType: 'uploader',
            dueDate: getDateOffset(7),
            status: 'pending',
            assignedAt: getDateOffset(-22),
            completedAt: null,
        },
        {
            entityId: 10,
            stakeholderId: 11,
            roleType: 'reviewer',
            dueDate: getDateOffset(-38),
            status: 'completed',
            assignedAt: getDateOffset(-50),
            completedAt: getDateOffset(-36),
        },
        {
            entityId: 10,
            stakeholderId: 16,
            roleType: 'approver',
            dueDate: getDateOffset(-42),
            status: 'completed',
            assignedAt: getDateOffset(-56),
            completedAt: getDateOffset(-40),
        },
        {
            entityId: 10,
            stakeholderId: 12,
            roleType: 'reviewer',
            dueDate: getDateOffset(-14),
            status: 'overdue',
            assignedAt: getDateOffset(-26),
            completedAt: null,
        },
    ];

    await db.insert(assignments).values(sampleAssignments);
    
    console.log('✅ Assignments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});