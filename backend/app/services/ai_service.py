import os
import json
from groq import Groq
from dotenv import load_dotenv
from ..models import Attribute, Evidence

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def enrich_product(mpn: str, description: str):
    try:
        prompt = f"""
        Extract product attributes from the following description.
        Product Description: {description}
        
        Return ONLY a valid JSON array of objects, where each object has:
        "name" (e.g. Category, Material, Pressure, Connection),
        "value" (the extracted value),
        "confidence" (a number between 0 and 100),
        "snippet" (the exact text snippet from the description where you found this).
        
        Example output:
        [
          {{"name": "Material", "value": "Stainless Steel", "confidence": 95, "snippet": "Made of stainless steel"}}
        ]
        """
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        
        raw_text = response.choices[0].message.content.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3]
            
        data = json.loads(raw_text.strip())
        
        attributes = []
        evidences = []
        for item in data:
            attr_name = item.get("name", "Unknown")
            confidence_val = float(item.get("confidence", 80.0))
            attributes.append(Attribute(
                name=attr_name,
                value=item.get("value", ""),
                confidence=confidence_val,
                status="verified" if confidence_val >= 80 else "needs_review"
            ))
            evidences.append(Evidence(
                attribute_name=attr_name,
                source="Live AI Extraction",
                page="1",
                snippet=item.get("snippet", "")
            ))
        return attributes, evidences
    except Exception as e:
        print("Groq API Error:", e)
        # Fallback if Groq fails
        attributes = [Attribute(name="Category", value="General Part", confidence=85.0, status="extracted")]
        evidences = [Evidence(attribute_name="Category", source="System Fallback", page="1", snippet=description)]
        return attributes, evidences
