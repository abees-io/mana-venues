from supabase import create_client
from filter_clean_venues import NON_AUDITORIUMS

SUPABASE_URL = "https://efhmmsprizhptpecllrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaG1tc3ByaXpocHRwZWNsbHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTE5MDYsImV4cCI6MjEwOTE4NzkwNn0.Xm3KFeOpcQpFNlmEG83X_TguqkW3hPCN21eD7GtpZ_Q"

client = create_client(SUPABASE_URL, SUPABASE_KEY)

print(f"Purging {len(NON_AUDITORIUMS)} non-auditorium/duplicate entries from Supabase...")
for name in NON_AUDITORIUMS:
    res = client.table("auditoriums").update({
        "district": "ARCHIVED",
        "city": "ARCHIVED",
        "name": "[DELETED_DUMMY]",
        "title": "[DELETED_DUMMY]",
        "photos": [],
        "verified": False,
        "is_verified": False,
        "is_claimed": False
    }).ilike("name", f"%{name}%").execute()
    print(f"Purged '{name}': {len(res.data or [])} rows updated.")

# Verify active rows in Supabase
active_res = client.table("auditoriums").select("id, name, district").neq("district", "ARCHIVED").execute()
active_rows = active_res.data or []
print(f"Active real auditoriums in Supabase: {len(active_rows)}")

