// This file is deprecated. 
// PostgreSQL: use lib/postgres.ts
// MongoDB: use utils/mongodb.ts
// Kept for backward compatibility - do not use for new code.

export { query, queryOne } from "./postgres";
export { getDb } from "@/utils/mongodb";
