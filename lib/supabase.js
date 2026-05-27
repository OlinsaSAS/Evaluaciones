import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hkvztfsensnmiserwnfx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrdnp0ZnNlbnNubWlzZXJ3bmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjQ0NzQsImV4cCI6MjA2Mzk0MDQ3NH0.ur9BOrciwoI8tPNFVvGAsoiwHD9PCrcTtPlbv28XIT8"

export const supabase = createClient(supabaseUrl, supabaseKey)
