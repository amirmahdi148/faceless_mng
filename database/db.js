import pg from "pg";
const { Pool } = pg;

export const sql = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveUser(id, name, username, bio, avatar) {
  try {
    await sql.query(
      `INSERT INTO users (id, name, username, bio, avatar)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         username = EXCLUDED.username,
         bio = EXCLUDED.bio,
         avatar = EXCLUDED.avatar`,
      [id, name, username, bio, avatar]
    );
    return "Set Successfully";
  } catch (e) {
    console.error(e);
    return "Set Error";
  }
}
