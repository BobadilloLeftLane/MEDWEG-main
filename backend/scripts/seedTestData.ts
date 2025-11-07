import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../src/config/database';
import { encrypt } from '../src/utils/encryption';
import logger from '../src/utils/logger';
import { UserRole } from '../src/types';

/**
 * Seed Test Data Script
 * Čisti bazu i ubacuje test podatke za testiranje
 */

interface InstitutionWithUser {
  institution: {
    name: string;
    address_street: string;
    address_plz: string;
    address_city: string;
  };
  user: {
    email: string;
    password: string;
    role: UserRole;
  };
}

const testData: InstitutionWithUser[] = [
  // 1. Admin aplikacije (bez institucije, samo user)
  {
    institution: {
      name: 'MEDWEG Administration',
      address_street: 'Hauptstraße 1',
      address_plz: '10115',
      address_city: 'Berlin',
    },
    user: {
      email: 'admin@gmail.com',
      password: 'Admin123!',
      role: UserRole.ADMIN_APPLICATION,
    },
  },
  // 2. Pflegedienst 1
  {
    institution: {
      name: 'Pflege Berlin Mitte',
      address_street: 'Friedrichstraße 23',
      address_plz: '10969',
      address_city: 'Berlin',
    },
    user: {
      email: 'pflege.mitte@gmail.com',
      password: 'Admin123!',
      role: UserRole.ADMIN_INSTITUTION,
    },
  },
  // 3. Pflegedienst 2
  {
    institution: {
      name: 'Pflege München Süd',
      address_street: 'Lindwurmstraße 45',
      address_plz: '80337',
      address_city: 'München',
    },
    user: {
      email: 'pflege.muenchen@gmail.com',
      password: 'Admin123!',
      role: UserRole.ADMIN_INSTITUTION,
    },
  },
  // 4. Pflegedienst 3
  {
    institution: {
      name: 'Pflege Hamburg Nord',
      address_street: 'Eppendorfer Weg 78',
      address_plz: '20259',
      address_city: 'Hamburg',
    },
    user: {
      email: 'pflege.hamburg@gmail.com',
      password: 'Admin123!',
      role: UserRole.ADMIN_INSTITUTION,
    },
  },
];

/**
 * Cleanup - Briši sve podatke
 */
async function cleanup() {
  logger.info('🗑️  Čistim bazu podataka...');

  const client = await pool.connect();

  try {
    await client.query('TRUNCATE TABLE order_items CASCADE');
    await client.query('TRUNCATE TABLE orders CASCADE');
    await client.query('TRUNCATE TABLE products CASCADE');
    await client.query('TRUNCATE TABLE patients CASCADE');
    await client.query('TRUNCATE TABLE workers CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    await client.query('TRUNCATE TABLE institutions CASCADE');

    logger.info('✅ Baza očišćena');
  } finally {
    client.release();
  }
}

/**
 * Seed test data
 */
async function seedData() {
  logger.info('🌱 Ubacujem test podatke...');

  const client = await pool.connect();

  try {
    for (const data of testData) {
      // 1. Hash password
      const passwordHash = await bcrypt.hash(data.user.password, 10);

      // 2. Encrypt address
      const encryptedAddress = await encrypt(data.institution.address_street);

      // 3. Create institution
      const institutionId = uuidv4();
      await client.query(
        `INSERT INTO institutions (
          id, name, address_street, address_plz, address_city,
          is_verified, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          institutionId,
          data.institution.name,
          encryptedAddress,
          data.institution.address_plz,
          data.institution.address_city,
          true, // is_verified
          true, // is_active
        ]
      );

      // 4. Create user
      const userId = uuidv4();
      const institutionIdForUser =
        data.user.role === UserRole.ADMIN_APPLICATION ? null : institutionId;

      await client.query(
        `INSERT INTO users (
          id, email, password_hash, role, institution_id,
          is_verified, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          userId,
          data.user.email,
          passwordHash,
          data.user.role,
          institutionIdForUser,
          true, // is_verified
          true, // is_active
        ]
      );

      logger.info(`  ✓ ${data.institution.name} - ${data.user.email}`);
    }

    logger.info('✅ Test podaci ubačeni');
  } finally {
    client.release();
  }
}

/**
 * Main function
 */
async function main() {
  try {
    logger.info('========================================');
    logger.info('MEDWEG - Test Data Seeding');
    logger.info('========================================\n');

    await cleanup();
    await seedData();

    logger.info('\n========================================');
    logger.info('✅ SEEDING USPEŠNO ZAVRŠEN!');
    logger.info('========================================\n');

    logger.info('Test nalozi:\n');
    logger.info('1. ADMIN APLIKACIJE:');
    logger.info('   Email: admin@gmail.com');
    logger.info('   Password: Admin123!\n');
    logger.info('2. Pflegedienst Berlin:');
    logger.info('   Email: pflege.mitte@gmail.com');
    logger.info('   Password: Admin123!\n');
    logger.info('3. Pflegedienst München:');
    logger.info('   Email: pflege.muenchen@gmail.com');
    logger.info('   Password: Admin123!\n');
    logger.info('4. Pflegedienst Hamburg:');
    logger.info('   Email: pflege.hamburg@gmail.com');
    logger.info('   Password: Admin123!\n');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Greška pri seedingu:', error);
    process.exit(1);
  }
}

// Run
main();
