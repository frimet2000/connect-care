import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSchema() {
    console.log("Starting schema debugging...");
    
    // 1. Check connection
    const { data: healthCheck, error: healthError } = await supabase.from('therapists').select('count', { count: 'exact', head: true });
    if (healthError) {
        console.error("Health check failed (cannot access 'therapists'):", healthError);
    } else {
        console.log("Health check passed. Connection OK.");
    }

    // 2. Try to access the table directly
    console.log("Attempting to access 'therapist_schedules'...");
    const { data, error } = await supabase.from('therapist_schedules').select('*').limit(1);
    
    if (error) {
        console.error("Direct access error:", error);
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);
        console.log("Error details:", error.details);
        console.log("Error hint:", error.hint);
    } else {
        console.log("Success! Table is accessible.");
        console.log("Data sample:", data);
    }
}

debugSchema();
