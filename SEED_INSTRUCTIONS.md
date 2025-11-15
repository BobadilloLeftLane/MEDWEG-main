# 📋 Uputstva za Seed Scriptove i Cleanup

## ⚠️ Pre nego što počnete

**VAŽNO**: Ovi scriptovi će dodati test podatke u bazu. Pokrenite ih samo u development okruženju!

---

## 🧹 Korak 0: Cleanup Database (Opciono)

Ako želite da obrišete sve podatke osim admin korisnika i admin proizvoda:

### **U pgAdmin:**
1. Otvori pgAdmin
2. Konektuj se na `medweg` bazu
3. Desni klik na `medweg` → **Query Tool**
4. Otvori fajl: `backend/cleanup_database.sql`
5. Klikni **Execute** (F5)
6. Proveri output - trebalo bi da vidiš `✅ Cleanup completed successfully!`

---

## 📦 Korak 1: Seed Institutions

**Šta radi**: Kreira 3 test institucije (Altenheim München Zentral, Pflegeheim Berlin Nord, Seniorenresidenz Hamburg Süd)

### **Pokretanje:**

```bash
cd backend
npx ts-node src/scripts/seedInstitutions.ts
```

### **Očekivan output:**
```
🏥 Starting institution seeding...
✅ Created institution: Altenheim München Zentral
✅ Created institution: Pflegeheim Berlin Nord
✅ Created institution: Seniorenresidenz Hamburg Süd
✅ Seeding completed! Created 3 institutions.
```

---

## 👥 Korak 2: Seed Patients

**Šta radi**: Kreira po 50 pacijenata za svaku instituciju (ukupno 150 pacijenata)

### **Pokretanje:**

```bash
cd backend
npx ts-node src/scripts/seedPatients.ts
```

### **Očekivan output:**
```
👥 Starting patient seeding...
Found 3 institutions
Creating 50 patients for Altenheim München Zentral...
✅ Created 50 patients for Altenheim München Zentral
Creating 50 patients for Pflegeheim Berlin Nord...
✅ Created 50 patients for Pflegeheim Berlin Nord
Creating 50 patients for Seniorenresidenz Hamburg Süd...
✅ Created 50 patients for Seniorenresidenz Hamburg Süd
✅ Seeding completed! Created 150 patients total.
```

---

## 📦 Korak 3: Seed Orders

**Šta radi**: Kreira po 20 narudžbina za svaku instituciju sa različitim statusima

### **Pokretanje:**

```bash
cd backend
npx ts-node src/scripts/seedOrders.ts
```

### **Očekivan output:**
```
📦 Starting order seeding...
Found 3 institutions
Found 6 products
Creating 20 orders for Altenheim München Zentral...
✅ Created 20 orders for Altenheim München Zentral
Creating 20 orders for Pflegeheim Berlin Nord...
✅ Created 20 orders for Pflegeheim Berlin Nord
Creating 20 orders for Seniorenresidenz Hamburg Süd...
✅ Created 20 orders for Seniorenresidenz Hamburg Süd
✅ Seeding completed! Created 60 orders total.
```

---

## 🎯 Kompletan Workflow

Ako želiš da počneš od nule sa fresh podacima:

```bash
# 1. Prvo očisti bazu u pgAdmin (cleanup_database.sql)
# 2. Zatim pokreni scriptove redom:

cd backend

# Kreiraj institucije
npx ts-node src/scripts/seedInstitutions.ts

# Kreiraj pacijente
npx ts-node src/scripts/seedPatients.ts

# Kreiraj narudžbine
npx ts-node src/scripts/seedOrders.ts
```

---

## ✅ Verifikacija

Nakon što pokreneš sve scriptove, u bazi bi trebalo da imaš:

- ✅ **3 institucije**
- ✅ **150 pacijenata** (50 po instituciji)
- ✅ **60 narudžbina** (20 po instituciji)
- ✅ Admin korisnik i proizvode

### Provera u pgAdmin:

```sql
SELECT 'Institutions' as table_name, COUNT(*) as count FROM institutions
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products;
```

---

## 🚨 Greške i Rešenja

### Error: "Cannot find module"
```bash
# Instaliraj dependencies
cd backend
npm install
```

### Error: "Connection refused"
```bash
# Proveri da li je PostgreSQL pokrenut
# Proveri .env fajl i database credentials
```

### Error: "Institution not found"
```bash
# Prvo pokreni seedInstitutions.ts
npx ts-node src/scripts/seedInstitutions.ts
```

### Error: "No patients found"
```bash
# Prvo pokreni seedPatients.ts
npx ts-node src/scripts/seedPatients.ts
```

---

## 📝 Napomene

- 🔒 **Enkriptovani podaci**: Svi patient podaci (ime, prezime, adresa) su enkriptovani u bazi
- 🎲 **Random podaci**: Imena, adrese i datumi su random generisani
- 💰 **Cene**: Narudžbine koriste stvarne cene proizvoda iz baze
- 📅 **Datumi**: Orders su kreirani sa random datumima iz poslednja 3 meseca
- ⚡ **Statusi**: Orders imaju različite statuse (pending, confirmed, shipped, delivered)

---

## 🎉 Gotovo!

Sada imaš full populated test environment spreman za development i testiranje! 🚀
