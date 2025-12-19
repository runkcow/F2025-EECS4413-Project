
import path from "path";
import Database from "better-sqlite3";

const db = new Database(path.resolve("db/data.db"));

export default db;
