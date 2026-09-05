// Shared Supabase connection used by calendary.html, movies.html and reads.html.
// The anon key below is meant to be public-facing (it's what runs in the browser) -
// access is controlled by the Row Level Security policies set up in the database itself.
const SUPABASE_URL = 'https://bkqeohmgspmtahcxsyfu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWVvaG1nc3BtdGFoY3hzeWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MzgxNjAsImV4cCI6MjEwNDIxNDE2MH0.AnMgeOYFOG5iOWWKkcj689xbD_O6JBt7k5hIoc1yGJg';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);