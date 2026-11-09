from supabase import create_client

SUPABASE_URL = "https://efhmmsprizhptpecllrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaG1tc3ByaXpocHRwZWNsbHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTE5MDYsImV4cCI6MjEwOTE4NzkwNn0.Xm3KFeOpcQpFNlmEG83X_TguqkW3hPCN21eD7GtpZ_Q"

client = create_client(SUPABASE_URL, SUPABASE_KEY)

dummy_ids = [
    "a1000000-0000-0000-0000-000000000001",
    "a1000000-0000-0000-0000-000000000002",
    "a1000000-0000-0000-0000-000000000003",
    "a1000000-0000-0000-0000-000000000004",
    "a1000000-0000-0000-0000-000000000005",
    "a1000000-0000-0000-0000-000000000006",
]

for did in dummy_ids:
    res = client.table("auditoriums").update({
        "name": "[DELETED_DUMMY]",
        "title": "[DELETED_DUMMY]",
        "district": "ARCHIVED",
        "city": "ARCHIVED",
        "photos": [],
        "verified": False,
        "is_verified": False,
        "is_claimed": False,
        "slug": f"archived-dummy-{did[-6:]}"
    }).eq("id", did).execute()
    print(f"Deactivated {did}: {res.data}")

print("All 6 dummy auditoriums have been purged from active status.")

