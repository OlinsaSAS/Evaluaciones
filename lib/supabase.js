import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hkvztfsensnmiserwnfx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrdnp0ZnNlbnNubWlzZXJ3bmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTg3MjUsImV4cCI6MjA5NTQ3NDcyNX0.ur9BOrciwoI8tPNFVvGAsoiwHD9PCrcTtPlbv28XIT8"

export const supabase = createClient(supabaseUrl, supabaseKey)
