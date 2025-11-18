import { pool } from '../config/database';
import * as bcrypt from 'bcrypt';

/**
 * Seed Script: Create 100 Institutions with Admin Accounts
 * Password for all: Admin123!
 */

// German cities
const cities = [
  'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
  'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg',
  'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe',
  'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Mönchengladbach',
  'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen', 'Halle', 'Magdeburg', 'Freiburg',
  'Krefeld', 'Lübeck', 'Oberhausen', 'Erfurt', 'Mainz', 'Rostock', 'Kassel',
];

// German street names
const streets = [
  'Hauptstraße', 'Bahnhofstraße', 'Gartenstraße', 'Kirchstraße', 'Schulstraße',
  'Bergstraße', 'Dorfstraße', 'Lindenstraße', 'Marktstraße', 'Mittelstraße',
  'Mühlenstraße', 'Poststraße', 'Ringstraße', 'Schlossstraße', 'Waldstraße',
  'Friedrichstraße', 'Goethestraße', 'Schillerstraße', 'Bismarckstraße',
  'Mozartstraße', 'Beethovenstraße', 'Bachstraße', 'Wilhelmstraße',
];

// Institution types
const institutionTypes = [
  'Krankenhaus', 'Klinik', 'Pflegeheim', 'Altenheim', 'Seniorenheim',
  'Reha-Zentrum', 'Gesundheitszentrum', 'Medizinisches Versorgungszentrum',
  'Tagesklinik', 'Ambulanz',
];

// Generate random German postal code
const generatePostalCode = (city: string): string => {
  const ranges: Record<string, [number, number]> = {
    'Berlin': [10115, 14199],
    'Hamburg': [20095, 22769],
    'München': [80331, 81929],
    'Köln': [50667, 51149],
    'Frankfurt': [60311, 60599],
    'Stuttgart': [70173, 70619],
    'Düsseldorf': [40210, 40629],
    'Dortmund': [44135, 44388],
    'Leipzig': [4103, 4357],
    'Dresden': [1067, 1328],
  };

  const range = ranges[city] || [10000, 99999];
  const code = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  return String(code).padStart(5, '0');
};

// Generate institution name
const generateInstitutionName = (index: number): string => {
  const type = institutionTypes[Math.floor(Math.random() * institutionTypes.length)];
  const city = cities[index % cities.length];
  const district = ['Nord', 'Süd', 'Ost', 'West', 'Mitte', 'Zentral'][Math.floor(Math.random() * 6)];

  return `${type} ${city} ${district}`;
};

// Generate address parts
const generateAddress = (index: number) => {
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  const city = cities[index % cities.length];
  const postalCode = generatePostalCode(city);

  return {
    street: `${street} ${number}`,
    plz: postalCode,
    city: city,
  };
};

// Generate email from institution name
const generateEmail = (institutionName: string, index: number): string => {
  const slug = institutionName
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `admin${index + 1}@${slug}.de`;
};

const seedInstitutions = async () => {
  const client = await pool.connect();

  try {
    console.log(' Starting institution seeding...\n');

    await client.query('BEGIN');

    // Hash password once (same for all)
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    let successCount = 0;

    for (let i = 0; i < 100; i++) {
      try {
        const institutionName = generateInstitutionName(i);
        const address = generateAddress(i);
        const email = generateEmail(institutionName, i);

        // Insert institution
        const institutionResult = await client.query(
          `INSERT INTO institutions (name, address_street, address_plz, address_city, is_verified, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING id`,
          [institutionName, address.street, address.plz, address.city]
        );

        const institutionId = institutionResult.rows[0].id;

        // Insert admin user
        await client.query(
          `INSERT INTO users (email, password_hash, role, institution_id, is_verified, is_active, created_at, updated_at)
           VALUES ($1, $2, 'admin_institution', $3, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [email, hashedPassword, institutionId]
        );

        successCount++;

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(` Created ${i + 1}/100 institutions...`);
        }

      } catch (error: any) {
        console.error(` Error creating institution ${i + 1}:`, error.message);
      }
    }

    await client.query('COMMIT');

    console.log(`\n Successfully created ${successCount}/100 institutions!`);
    console.log(`\n All institutions have admin accounts with password: Admin123!`);
    console.log(`\n Example logins:`);

    // Show first 5 examples
    const examples = await client.query(
      `SELECT u.email, i.name, i.address_street, i.address_plz, i.address_city
       FROM users u
       JOIN institutions i ON u.institution_id = i.id
       WHERE u.role = 'admin_institution'
       ORDER BY u.created_at DESC
       LIMIT 5`
    );

    examples.rows.forEach((row, idx) => {
      console.log(`\n${idx + 1}. Institution: ${row.name}`);
      console.log(`   Address: ${row.address_street}, ${row.address_plz} ${row.address_city}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Password: Admin123!`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error seeding institutions:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the script
seedInstitutions()
  .then(() => {
    console.log('\n Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Seeding failed:', error);
    process.exit(1);
  });
