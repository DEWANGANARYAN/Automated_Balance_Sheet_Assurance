import { db } from '@/db';
import { entities } from '@/db/schema';

async function main() {
    const sampleEntities = [
        // Finance - North America (5 entities)
        {
            name: 'Finance - North America - Corporate Treasury',
            code: 'ENT-FIN-001',
            department: 'Finance',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-03-15').toISOString(),
            updatedAt: new Date('2023-03-15').toISOString(),
        },
        {
            name: 'Finance - North America - Tax Division',
            code: 'ENT-FIN-002',
            department: 'Finance',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-05-22').toISOString(),
            updatedAt: new Date('2023-05-22').toISOString(),
        },
        {
            name: 'Finance - North America - Accounts Payable',
            code: 'ENT-FIN-003',
            department: 'Finance',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-07-10').toISOString(),
            updatedAt: new Date('2023-07-10').toISOString(),
        },
        {
            name: 'Finance - North America - Accounts Receivable',
            code: 'ENT-FIN-004',
            department: 'Finance',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-08-18').toISOString(),
            updatedAt: new Date('2023-08-18').toISOString(),
        },
        {
            name: 'Finance - North America - Payroll Services',
            code: 'ENT-FIN-005',
            department: 'Finance',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-09-25').toISOString(),
            updatedAt: new Date('2023-09-25').toISOString(),
        },
        
        // Finance - Europe (4 entities)
        {
            name: 'Finance - Europe - Regional Controller',
            code: 'ENT-FIN-006',
            department: 'Finance',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-04-12').toISOString(),
            updatedAt: new Date('2023-04-12').toISOString(),
        },
        {
            name: 'Finance - Europe - Treasury Operations',
            code: 'ENT-FIN-007',
            department: 'Finance',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-06-08').toISOString(),
            updatedAt: new Date('2023-06-08').toISOString(),
        },
        {
            name: 'Finance - Europe - VAT Compliance',
            code: 'ENT-FIN-008',
            department: 'Finance',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-10-14').toISOString(),
            updatedAt: new Date('2023-10-14').toISOString(),
        },
        {
            name: 'Finance - Europe - Financial Planning',
            code: 'ENT-FIN-009',
            department: 'Finance',
            region: 'Europe',
            status: 'inactive',
            createdAt: new Date('2023-02-20').toISOString(),
            updatedAt: new Date('2024-08-10').toISOString(),
        },
        
        // Finance - Asia Pacific (3 entities)
        {
            name: 'Finance - Asia Pacific - Regional Finance',
            code: 'ENT-FIN-010',
            department: 'Finance',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-05-30').toISOString(),
            updatedAt: new Date('2023-05-30').toISOString(),
        },
        {
            name: 'Finance - Asia Pacific - Trade Finance',
            code: 'ENT-FIN-011',
            department: 'Finance',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-11-05').toISOString(),
            updatedAt: new Date('2023-11-05').toISOString(),
        },
        {
            name: 'Finance - Asia Pacific - Cost Accounting',
            code: 'ENT-FIN-012',
            department: 'Finance',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        
        // Finance - Latin America (2 entities)
        {
            name: 'Finance - Latin America - Financial Controller',
            code: 'ENT-FIN-013',
            department: 'Finance',
            region: 'Latin America',
            status: 'active',
            createdAt: new Date('2023-07-22').toISOString(),
            updatedAt: new Date('2023-07-22').toISOString(),
        },
        {
            name: 'Finance - Latin America - Revenue Accounting',
            code: 'ENT-FIN-014',
            department: 'Finance',
            region: 'Latin America',
            status: 'active',
            createdAt: new Date('2024-02-14').toISOString(),
            updatedAt: new Date('2024-02-14').toISOString(),
        },
        
        // Finance - Middle East (1 entity)
        {
            name: 'Finance - Middle East - Regional Treasury',
            code: 'ENT-FIN-015',
            department: 'Finance',
            region: 'Middle East',
            status: 'active',
            createdAt: new Date('2023-12-08').toISOString(),
            updatedAt: new Date('2023-12-08').toISOString(),
        },
        
        // Operations - North America (4 entities)
        {
            name: 'Operations - North America - Manufacturing Unit 1',
            code: 'ENT-OPS-001',
            department: 'Operations',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-03-28').toISOString(),
            updatedAt: new Date('2023-03-28').toISOString(),
        },
        {
            name: 'Operations - North America - Distribution Center',
            code: 'ENT-OPS-002',
            department: 'Operations',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-06-15').toISOString(),
            updatedAt: new Date('2023-06-15').toISOString(),
        },
        {
            name: 'Operations - North America - Warehouse Services',
            code: 'ENT-OPS-003',
            department: 'Operations',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-09-10').toISOString(),
            updatedAt: new Date('2023-09-10').toISOString(),
        },
        {
            name: 'Operations - North America - Supply Chain',
            code: 'ENT-OPS-004',
            department: 'Operations',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        
        // Operations - Europe (4 entities)
        {
            name: 'Operations - Europe - Manufacturing Hub',
            code: 'ENT-OPS-005',
            department: 'Operations',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-04-20').toISOString(),
            updatedAt: new Date('2023-04-20').toISOString(),
        },
        {
            name: 'Operations - Europe - Logistics Center',
            code: 'ENT-OPS-006',
            department: 'Operations',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-07-30').toISOString(),
            updatedAt: new Date('2023-07-30').toISOString(),
        },
        {
            name: 'Operations - Europe - Quality Assurance',
            code: 'ENT-OPS-007',
            department: 'Operations',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-10-25').toISOString(),
            updatedAt: new Date('2023-10-25').toISOString(),
        },
        {
            name: 'Operations - Europe - Procurement Division',
            code: 'ENT-OPS-008',
            department: 'Operations',
            region: 'Europe',
            status: 'inactive',
            createdAt: new Date('2023-03-10').toISOString(),
            updatedAt: new Date('2024-09-15').toISOString(),
        },
        
        // Operations - Asia Pacific (2 entities)
        {
            name: 'Operations - Asia Pacific - Production Unit',
            code: 'ENT-OPS-009',
            department: 'Operations',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-05-18').toISOString(),
            updatedAt: new Date('2023-05-18').toISOString(),
        },
        {
            name: 'Operations - Asia Pacific - Regional Logistics',
            code: 'ENT-OPS-010',
            department: 'Operations',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-11-22').toISOString(),
            updatedAt: new Date('2023-11-22').toISOString(),
        },
        
        // Operations - Latin America (1 entity)
        {
            name: 'Operations - Latin America - Operations Hub',
            code: 'ENT-OPS-011',
            department: 'Operations',
            region: 'Latin America',
            status: 'active',
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-08').toISOString(),
        },
        
        // Operations - Middle East (1 entity)
        {
            name: 'Operations - Middle East - Regional Operations',
            code: 'ENT-OPS-012',
            department: 'Operations',
            region: 'Middle East',
            status: 'active',
            createdAt: new Date('2023-12-20').toISOString(),
            updatedAt: new Date('2023-12-20').toISOString(),
        },
        
        // Sales - North America (3 entities)
        {
            name: 'Sales - North America - Enterprise Sales',
            code: 'ENT-SAL-001',
            department: 'Sales',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-04-05').toISOString(),
            updatedAt: new Date('2023-04-05').toISOString(),
        },
        {
            name: 'Sales - North America - Regional Sales',
            code: 'ENT-SAL-002',
            department: 'Sales',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-08-12').toISOString(),
            updatedAt: new Date('2023-08-12').toISOString(),
        },
        {
            name: 'Sales - North America - Channel Partners',
            code: 'ENT-SAL-003',
            department: 'Sales',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        
        // Sales - Europe (3 entities)
        {
            name: 'Sales - Europe - Corporate Sales',
            code: 'ENT-SAL-004',
            department: 'Sales',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-05-10').toISOString(),
            updatedAt: new Date('2023-05-10').toISOString(),
        },
        {
            name: 'Sales - Europe - EMEA Sales Division',
            code: 'ENT-SAL-005',
            department: 'Sales',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-09-20').toISOString(),
            updatedAt: new Date('2023-09-20').toISOString(),
        },
        {
            name: 'Sales - Europe - Business Development',
            code: 'ENT-SAL-006',
            department: 'Sales',
            region: 'Europe',
            status: 'inactive',
            createdAt: new Date('2023-02-15').toISOString(),
            updatedAt: new Date('2024-07-22').toISOString(),
        },
        
        // Sales - Asia Pacific (2 entities)
        {
            name: 'Sales - Asia Pacific - Regional Sales',
            code: 'ENT-SAL-007',
            department: 'Sales',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-06-28').toISOString(),
            updatedAt: new Date('2023-06-28').toISOString(),
        },
        {
            name: 'Sales - Asia Pacific - Key Accounts',
            code: 'ENT-SAL-008',
            department: 'Sales',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-12-15').toISOString(),
            updatedAt: new Date('2023-12-15').toISOString(),
        },
        
        // Sales - Latin America (1 entity)
        {
            name: 'Sales - Latin America - Territory Sales',
            code: 'ENT-SAL-009',
            department: 'Sales',
            region: 'Latin America',
            status: 'active',
            createdAt: new Date('2024-03-08').toISOString(),
            updatedAt: new Date('2024-03-08').toISOString(),
        },
        
        // Sales - Middle East (1 entity)
        {
            name: 'Sales - Middle East - Regional Sales',
            code: 'ENT-SAL-010',
            department: 'Sales',
            region: 'Middle East',
            status: 'active',
            createdAt: new Date('2023-11-30').toISOString(),
            updatedAt: new Date('2023-11-30').toISOString(),
        },
        
        // IT - North America (3 entities)
        {
            name: 'IT - North America - Infrastructure Services',
            code: 'ENT-ITD-001',
            department: 'IT',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-03-22').toISOString(),
            updatedAt: new Date('2023-03-22').toISOString(),
        },
        {
            name: 'IT - North America - Application Development',
            code: 'ENT-ITD-002',
            department: 'IT',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-07-18').toISOString(),
            updatedAt: new Date('2023-07-18').toISOString(),
        },
        {
            name: 'IT - North America - Cybersecurity Division',
            code: 'ENT-ITD-003',
            department: 'IT',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-10-30').toISOString(),
            updatedAt: new Date('2023-10-30').toISOString(),
        },
        
        // IT - Europe (2 entities)
        {
            name: 'IT - Europe - Technology Operations',
            code: 'ENT-ITD-004',
            department: 'IT',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-04-25').toISOString(),
            updatedAt: new Date('2023-04-25').toISOString(),
        },
        {
            name: 'IT - Europe - Data Center Services',
            code: 'ENT-ITD-005',
            department: 'IT',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-08-15').toISOString(),
            updatedAt: new Date('2023-08-15').toISOString(),
        },
        
        // IT - Asia Pacific (1 entity)
        {
            name: 'IT - Asia Pacific - Regional IT Services',
            code: 'ENT-ITD-006',
            department: 'IT',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-11-12').toISOString(),
            updatedAt: new Date('2023-11-12').toISOString(),
        },
        
        // IT - Latin America (1 entity)
        {
            name: 'IT - Latin America - Technology Hub',
            code: 'ENT-ITD-007',
            department: 'IT',
            region: 'Latin America',
            status: 'active',
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        
        // IT - Middle East (1 entity)
        {
            name: 'IT - Middle East - Digital Services',
            code: 'ENT-ITD-008',
            department: 'IT',
            region: 'Middle East',
            status: 'inactive',
            createdAt: new Date('2023-06-05').toISOString(),
            updatedAt: new Date('2024-10-18').toISOString(),
        },
        
        // HR - North America (2 entities)
        {
            name: 'HR - North America - Talent Acquisition',
            code: 'ENT-HRD-001',
            department: 'HR',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-04-08').toISOString(),
            updatedAt: new Date('2023-04-08').toISOString(),
        },
        {
            name: 'HR - North America - Employee Relations',
            code: 'ENT-HRD-002',
            department: 'HR',
            region: 'North America',
            status: 'active',
            createdAt: new Date('2023-09-15').toISOString(),
            updatedAt: new Date('2023-09-15').toISOString(),
        },
        
        // HR - Europe (1 entity)
        {
            name: 'HR - Europe - HR Operations',
            code: 'ENT-HRD-003',
            department: 'HR',
            region: 'Europe',
            status: 'active',
            createdAt: new Date('2023-06-22').toISOString(),
            updatedAt: new Date('2023-06-22').toISOString(),
        },
        
        // HR - Asia Pacific (1 entity)
        {
            name: 'HR - Asia Pacific - Regional HR',
            code: 'ENT-HRD-004',
            department: 'HR',
            region: 'Asia Pacific',
            status: 'active',
            createdAt: new Date('2023-10-05').toISOString(),
            updatedAt: new Date('2023-10-05').toISOString(),
        },
        
        // HR - Latin America (1 entity)
        {
            name: 'HR - Latin America - HR Services',
            code: 'ENT-HRD-005',
            department: 'HR',
            region: 'Latin America',
            status: 'inactive',
            createdAt: new Date('2023-05-12').toISOString(),
            updatedAt: new Date('2024-11-05').toISOString(),
        },
    ];

    await db.insert(entities).values(sampleEntities);
    
    console.log('✅ Entities seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});