// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ubhptybpuofcmburvolj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaHB0eWJwdW9mY21idXJ2b2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTAwNTMsImV4cCI6MjA1OTMyNjA1M30.229EJxX_F6wSnS8F_js09XDComB3WUH5iK1qivAqExs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);