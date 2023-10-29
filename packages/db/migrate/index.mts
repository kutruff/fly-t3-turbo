import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
 
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 })
const db = drizzle(sql);
 
console.log("Migrating database...");
await migrate(db, { migrationsFolder: "migrations", });
console.log("done.");
process.exit(0);