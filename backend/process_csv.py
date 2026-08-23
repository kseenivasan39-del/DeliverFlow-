import time
import csv
import requests

CSV_FILE = r"C:\Users\kseen\.gemini\antigravity\brain\b99a2817-fc48-4b07-a712-ed8264ae8765\.user_uploaded\media_1787409698521.csv"
API_URL = "http://127.0.0.1:8000"

print("Starting background processing for Hackathon...")
with open(CSV_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    
    count = 0
    for row in reader:
        count += 1
        mpn = row.get("Mfg_Part_Num") or row.get("PART_NUMBER") or row.get("MPN") or f"CSV-MPN-{count}"
        brand = row.get("E1_Brand") or row.get("BRAND_NAME") or "Unknown Brand"
        desc = row.get("Part_Desc") or row.get("Description") or ""
        
        print(f"[{count}/1000] Processing MPN: {mpn}")
        
        # 1. Create Product
        try:
            res = requests.post(f"{API_URL}/products", json={"mpn": mpn, "brand": brand, "description": desc})
            if res.status_code == 200:
                product_id = res.json().get("id")
                
                # 2. Enrich Product
                if product_id:
                    requests.post(f"{API_URL}/products/{product_id}/enrich")
                    
                    # 3. Sleep to respect Groq limits (30 RPM = 2 seconds)
                    time.sleep(2.05)
        except Exception as e:
            print("Error:", e)

print("Finished processing all rows!")
