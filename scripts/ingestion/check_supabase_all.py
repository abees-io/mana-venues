import json
from supabase import create_client

SUPABASE_URL = "https://efhmmsprizhptpecllrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaG1tc3ByaXpocHRwZWNsbHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTE5MDYsImV4cCI6MjEwOTE4NzkwNn0.Xm3KFeOpcQpFNlmEG83X_TguqkW3hPCN21eD7GtpZ_Q"

client = create_client(SUPABASE_URL, SUPABASE_KEY)
res = client.table("auditoriums").select("id, name, title, slug, district, city, photos").execute()
rows = res.data or []
print(f"Total rows in Supabase: {len(rows)}")

unsplash_rows = []
dummy_rows = []
for r in rows:
    name = r.get("name") or r.get("title") or ""
    photos_str = str(r.get("photos") or "")
    
    if "unsplash" in photos_str or "placeholder" in photos_str:
        unsplash_rows.append((r["id"], name, r["slug"]))
        
    # Check for test / dummy data
    if any(k in name.lower() for k in ["dummy", "test", "demo", "sample", "fake"]):
        dummy_rows.append((r["id"], name, r["slug"]))

print(f"Venues with unsplash/placeholder photos: {len(unsplash_rows)}")
for u in unsplash_rows:
    print("  Unsplash venue:", u)

print(f"Dummy rows found: {len(dummy_rows)}")
for d in dummy_rows:
    print("  Dummy venue:", d)

