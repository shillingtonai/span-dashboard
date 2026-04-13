import { sql } from '@vercel/postgres'

export { sql }

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS manual_entries (
      id SERIAL PRIMARY KEY,
      entry_date DATE NOT NULL,
      installer_inquiries INTEGER DEFAULT 0,
      survey_social INTEGER DEFAULT 0,
      survey_google INTEGER DEFAULT 0,
      survey_word_of_mouth INTEGER DEFAULT 0,
      survey_installer_referral INTEGER DEFAULT 0,
      survey_other INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `
}
