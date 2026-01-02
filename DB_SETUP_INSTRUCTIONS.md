# Database Setup Instructions for ConnectCare

## Issue Description
The application is failing because the database schema is missing required tables and columns:
- `therapist_schedules` table is missing
- `weekly_schedule`, `availability_text`, `scheduling_mode`, and `reception_text` columns are missing from the `therapists` table

## Solution
A comprehensive SQL script has been created to fix the database schema: `fix_database_schema.sql`

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
1. Ensure you have the correct Supabase project linked:
   ```bash
   npx supabase link --project-ref wtgodboucxcyjecpjoyq
   ```

2. Push the migrations to your database:
   ```bash
   npx supabase db push
   ```

### Option 2: Direct SQL Execution
If you have direct access to your database (via Supabase Dashboard SQL Editor or psql):
1. Copy the content of `fix_database_schema.sql`
2. Execute it in your database

### Option 3: Local Development Setup
1. Start the local Supabase environment:
   ```bash
   npx supabase start
   ```
2. Apply the migrations:
   ```bash
   npx supabase db push
   ```

## What the Script Does
1. Adds missing columns to the `therapists` table if they don't exist:
   - `weekly_schedule` (JSONB type)
   - `availability_text` (TEXT type)
   - `scheduling_mode` (TEXT type with enum values)
   - `reception_text` (TEXT type)

2. Adds new values to the `profession_type` enum if they don't exist:
   - 'nutrition'
   - 'psychotherapy'

3. Creates the `therapist_schedules` table if it doesn't exist with proper relationships to the `therapists` table

4. Sets up proper Row Level Security (RLS) policies for the new table

5. Grants appropriate permissions to authenticated and anonymous users

6. Forces a schema cache reload

## Verification
The script includes a final query to verify that all required columns and tables have been created successfully.

## Troubleshooting
- If you get authentication errors, make sure your Supabase project is properly linked
- If you get permission errors, ensure your database user has sufficient privileges
- If the schema cache isn't updating, try running `NOTIFY pgrst, 'reload schema';` manually