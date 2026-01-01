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

async function verifyRPC() {
    console.log("Starting RPC verification...");

    // 1. Create a test user
    const email = `test.rpc.${Date.now()}@example.com`;
    const password = 'password123';
    
    console.log(`Creating test user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Test RPC User' }
        }
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error("User created but no ID returned");
        return;
    }
    console.log(`User created. ID: ${userId}`);

    // 2. Create a therapist record for this user
    console.log("Creating therapist record manually...");
    const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .insert({
            user_id: userId,
            profession: 'speech_therapy', // Changed to a definitely existing enum value
            city: 'Tel Aviv',
            // Removed fields that might be causing cache issues if schema changed
            // phone: '0500000000', 
            // email: email,
            is_active: true
        })
        .select()
        .single();

    if (therapistError) {
        console.error("Therapist Creation Error:", therapistError);
        // Clean up user
        await supabase.auth.admin.deleteUser(userId);
        return;
    }

    const therapistId = therapistData.id;
    console.log(`Therapist ID: ${therapistId}`);

    // 3. Login as the user to get a session (RPC requires authenticated user)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error("Login Error:", loginError);
        return;
    }

    // 4. Try direct UPSERT instead of RPC
    console.log("Calling direct UPSERT to therapist_schedules...");
    const testSchedule = [{ day: 'sunday', active: true, slots: ['09:00', '10:00'] }];
    
    const { data: rpcData, error: rpcError } = await supabase
        .from('therapist_schedules')
        .upsert({
            therapist_id: therapistId,
            weekly_schedule: testSchedule,
            scheduling_mode: 'slots',
            availability_text: 'Available on Sundays',
            updated_at: new Date().toISOString()
        }, { onConflict: 'therapist_id' })
        .select();

    if (rpcError) {
        console.error("RPC Failed:", rpcError);
    } else {
        console.log("RPC Success! Data returned:", rpcData);
    }

    // 5. Cleanup (optional, keeping for inspection)
    // await supabase.auth.admin.deleteUser(userId);
}

verifyRPC();
