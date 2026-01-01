import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to read .env manually since we might not have dotenv
const readEnv = () => {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const envPath = path.resolve(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) {
        console.error("Error reading .env", e);
        return {};
    }
};

const env = readEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVerification() {
    console.log("Starting backend verification for therapist_schedules...");

    // 1. Create a random test user
    const email = `test.agent.${Date.now()}@example.com`;
    const password = 'Password123!';
    
    console.log(`Creating test user: ${email}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test Agent',
                user_type: 'therapist'
            }
        }
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error("No user ID returned");
        return;
    }

    console.log(`User created. ID: ${userId}`);

    // 2. Create therapist record (simulating trigger or manual creation)
    // Note: If you have a trigger that creates a therapist on signup, wait for it.
    // If not, create it manually.
    
    // Let's check if therapist exists
    let { data: therapist, error: fetchError } = await supabase
        .from('therapists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    if (!therapist) {
        console.log("Creating therapist record manually...");
        const { data: newTherapist, error: createError } = await supabase
            .from('therapists')
            .insert({
                user_id: userId,
                profession: 'speech_therapy',
                city: 'Tel Aviv',
                years_experience: 5
            })
            .select()
            .single();
        
        if (createError) {
            console.error("Error creating therapist:", createError);
            return;
        }
        therapist = newTherapist;
    }

    console.log(`Therapist ID: ${therapist.id}`);

    // Check if table exists in information_schema
    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables') // This might not work via API directly depending on permissions
        .select('*')
        .limit(1);
        
    // Better check: try to just select count from the table, ignore error if it fails, just to see the error
     const { count, error: checkError } = await supabase.from('therapist_schedules').select('*', { count: 'exact', head: true });
     console.log("Check table existence error:", checkError);
     console.log("Current row count:", count);

     // 3. Insert schedule into therapist_schedules
     console.log("Inserting schedule data (trying simple INSERT first)...");
     
     const testSchedule = [
        { day: 'sunday', active: true, slots: ['09:00', '10:00'], hoursRange: '09:00 - 11:00' },
        { day: 'monday', active: false, slots: [], hoursRange: '' }
    ];
    
    const availabilityText = 'Available on Sundays';

     // Try simple insert
     const { data: insertData, error: insertError } = await supabase
        .from('therapist_schedules')
        .insert({
            therapist_id: therapist.id,
            weekly_schedule: testSchedule,
            availability_text: availabilityText
        })
        .select();

    if (insertError) {
        console.error("Insert Error:", insertError);
        console.log("Retrying with Upsert...");
        const { error: scheduleError } = await supabase
            .from('therapist_schedules')
            .upsert({
                therapist_id: therapist.id,
                weekly_schedule: testSchedule,
                availability_text: availabilityText
            });
            
        if (scheduleError) {
             console.error("Upsert Error:", scheduleError);
             return;
        }
    } else {
        console.log("Insert Successful:", insertData);
    }

    console.log("Schedule saved successfully.");

    // 4. Verify data
    console.log("Verifying data persistence...");
    
    const { data: verifyData, error: verifyError } = await supabase
        .from('therapist_schedules')
        .select('*')
        .eq('therapist_id', therapist.id)
        .single();

    if (verifyError) {
        console.error("Error fetching schedule:", verifyError);
        return;
    }

    if (verifyData) {
        console.log("Verification Successful!");
        console.log("--------------------------------");
        console.log("Saved Schedule:", JSON.stringify(verifyData.weekly_schedule, null, 2));
        console.log("Availability Text:", verifyData.availability_text);
        console.log("--------------------------------");
    } else {
        console.error("Verification Failed: No data found.");
    }
}

runVerification();
