import { pool } from '../config/database';
import { encrypt } from '../utils/encryption';

/**
 * Seed Script: Create 10-50 Patients for Each Institution
 */

// German first names
const firstNamesMale = [
  'Lukas', 'Leon', 'Maximilian', 'Felix', 'Paul', 'Jonas', 'Tim', 'Niklas', 'Jan',
  'Finn', 'Moritz', 'Noah', 'Elias', 'Ben', 'Philipp', 'Julian', 'David', 'Alexander',
  'Fabian', 'Simon', 'Tom', 'Luca', 'Marcel', 'Daniel', 'Sebastian', 'Christian',
  'Michael', 'Stefan', 'Thomas', 'Andreas', 'Matthias', 'Martin', 'Peter', 'Wolfgang',
  'Klaus', 'Jürgen', 'Hans', 'Dieter', 'Helmut', 'Günter', 'Karl', 'Heinz', 'Werner',
];

const firstNamesFemale = [
  'Emma', 'Mia', 'Hannah', 'Sophia', 'Anna', 'Lena', 'Leonie', 'Lea', 'Sarah',
  'Laura', 'Lisa', 'Marie', 'Lara', 'Julia', 'Katharina', 'Vanessa', 'Jennifer',
  'Christina', 'Sandra', 'Nicole', 'Melanie', 'Stefanie', 'Andrea', 'Petra', 'Sabine',
  'Monika', 'Gabriele', 'Karin', 'Susanne', 'Angelika', 'Renate', 'Ingrid', 'Helga',
  'Ursula', 'Christa', 'Gisela', 'Brigitte', 'Erika', 'Hildegard', 'Gertrud',
];

// German last names
const lastNames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann',
  'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann',
  'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer',
  'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung',
  'Hahn', 'Schubert', 'Vogel', 'Friedrich', 'Keller', 'Günther', 'Frank', 'Berger',
  'Winkler', 'Roth', 'Beck', 'Lorenz', 'Baumann', 'Franke', 'Albrecht', 'Schuster',
];

// German cities
const cities = [
  'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
  'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg',
  'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
];

// German streets
const streets = [
  'Hauptstraße', 'Bahnhofstraße', 'Gartenstraße', 'Kirchstraße', 'Schulstraße',
  'Bergstraße', 'Dorfstraße', 'Lindenstraße', 'Marktstraße', 'Mittelstraße',
  'Mühlenstraße', 'Poststraße', 'Ringstraße', 'Schlossstraße', 'Waldstraße',
  'Friedrichstraße', 'Goethestraße', 'Schillerstraße', 'Bismarckstraße',
];

// Generate random date of birth (60-95 years old for Pflegeheim patients)
const generateDateOfBirth = (): string => {
  const today = new Date();
  const age = Math.floor(Math.random() * 36) + 60; // 60-95 years
  const birthYear = today.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;

  return `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
};

// Generate random German address
const generateAddress = (): string => {
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  const postalCode = Math.floor(Math.random() * 89999) + 10000;
  const city = cities[Math.floor(Math.random() * cities.length)];

  return `${street} ${number}, ${postalCode} ${city}`;
};

// Generate unique patient code
const generateUniqueCode = (institutionIndex: number, patientIndex: number): string => {
  const prefix = 'P';
  const instNum = String(institutionIndex + 1).padStart(3, '0');
  const patNum = String(patientIndex + 1).padStart(3, '0');
  const random = Math.floor(Math.random() * 100);
  return `${prefix}${instNum}${patNum}${random}`;
};

const seedPatients = async () => {
  const client = await pool.connect();

  try {
    console.log(' Starting patient seeding...\n');

    await client.query('BEGIN');

    // Get all institutions
    const institutionsResult = await client.query(
      'SELECT id, name FROM institutions ORDER BY created_at'
    );

    const institutions = institutionsResult.rows;
    console.log(` Found ${institutions.length} institutions\n`);

    let totalPatients = 0;

    for (let i = 0; i < institutions.length; i++) {
      const institution = institutions[i];

      // Random number of patients between 10 and 50
      const patientCount = Math.floor(Math.random() * 41) + 10; // 10-50

      let createdCount = 0;

      for (let j = 0; j < patientCount; j++) {
        try {
          // Random gender
          const isMale = Math.random() > 0.5;
          const firstName = isMale
            ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
            : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

          const dateOfBirth = generateDateOfBirth();
          const address = generateAddress();
          const uniqueCode = generateUniqueCode(i, j);

          // Encrypt sensitive data
          const encryptedFirstName = await encrypt(firstName);
          const encryptedLastName = await encrypt(lastName);
          const encryptedDateOfBirth = await encrypt(dateOfBirth);
          const encryptedAddress = await encrypt(address);

          // Insert patient
          await client.query(
            `INSERT INTO patients (
              institution_id,
              first_name,
              last_name,
              date_of_birth,
              address,
              unique_code,
              is_active,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              institution.id,
              encryptedFirstName,
              encryptedLastName,
              encryptedDateOfBirth,
              encryptedAddress,
              uniqueCode,
            ]
          );

          createdCount++;
          totalPatients++;

        } catch (error: any) {
          console.error(`   Error creating patient for ${institution.name}:`, error.message);
        }
      }

      console.log(`   ${institution.name}: ${createdCount}/${patientCount} patients`);
    }

    await client.query('COMMIT');

    console.log(`\n Successfully created ${totalPatients} patients across ${institutions.length} institutions!`);
    console.log(`\n Average: ${Math.round(totalPatients / institutions.length)} patients per institution`);

    // Show some examples
    console.log('\n Example patients (decrypted):');
    const examplesResult = await client.query(
      `SELECT p.first_name, p.last_name, p.date_of_birth, i.name as institution_name
       FROM patients p
       JOIN institutions i ON p.institution_id = i.id
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    for (const row of examplesResult.rows) {
      const { decrypt } = await import('../utils/encryption');
      const firstName = await decrypt(row.first_name);
      const lastName = await decrypt(row.last_name);
      const dob = await decrypt(row.date_of_birth);

      console.log(`\n  Patient: ${firstName} ${lastName}`);
      console.log(`  DOB: ${dob}`);
      console.log(`  Institution: ${row.institution_name}`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error seeding patients:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the script
seedPatients()
  .then(() => {
    console.log('\n Patient seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Patient seeding failed:', error);
    process.exit(1);
  });
