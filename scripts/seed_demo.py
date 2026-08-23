#!/usr/bin/env python3
"""
seed_demo.py — Seeds the DeliverFlow SQLite database with three demo product records
for the industrial valve category:
  1. A fully verified product  (V-7200-SS-NPT  — ValveTech ball valve)
  2. A conflict product        (GV-4800-CS-FL  — FlowMaster gate valve)
  3. A missing evidence product(BV-MINI-SS-SW  — MicroFlow miniature ball valve)

Usage:
    python scripts/seed_demo.py

The script reads example JSON from contracts/examples/ and POSTs each product
to the running API (localhost:8000). Run the API server first.
"""

import json
import sys
import time
from pathlib import Path

import httpx

API_BASE = "http://localhost:8000"
EXAMPLES_DIR = Path(__file__).parent.parent / "contracts" / "examples"

FIXTURES = [
    {
        "file": "product_verified.json",
        "label": "Verified — ValveTech V-7200-SS-NPT",
    },
    {
        "file": "product_conflict.json",
        "label": "Conflict — FlowMaster GV-4800-CS-FL",
    },
    {
        "file": "product_missing.json",
        "label": "Missing Evidence — MicroFlow BV-MINI-SS-SW",
    },
]


def create_product(client: httpx.Client, mpn: str, brand: str, description: str) -> dict:
    response = client.post(
        "/products",
        json={"mpn": mpn, "brand": brand, "description": description},
    )
    if response.status_code == 409:
        print(f"  ⚠  Already exists: {mpn} — skipping creation")
        return None
    response.raise_for_status()
    return response.json()


def main():
    print("DeliverFlow Demo Seeder")
    print("=" * 50)

    with httpx.Client(base_url=API_BASE, timeout=10.0) as client:
        # Health check
        try:
            client.get("/").raise_for_status()
        except Exception:
            print(f"✗  Cannot reach API at {API_BASE}. Start the server first.")
            sys.exit(1)

        for fixture in FIXTURES:
            print(f"\n→  Seeding: {fixture['label']}")
            data = json.loads((EXAMPLES_DIR / fixture["file"]).read_text())

            product = create_product(
                client,
                mpn=data["mpn"],
                brand=data["brand"],
                description=data["description"],
            )

            if product is None:
                continue

            product_id = product["id"]
            print(f"   Created product: {product_id}")

            # Trigger enrichment
            print(f"   Starting enrichment pipeline...")
            resp = client.post(f"/products/{product_id}/enrich")
            resp.raise_for_status()
            print(f"   Pipeline status: {resp.json()['pipeline_status']}")

            # Brief pause between products
            time.sleep(1)

    print("\n✓  Seeding complete. Open http://localhost:3000 to explore the demo.")


if __name__ == "__main__":
    main()
