import csv
import io
from ..models import Product

def generate_csv(product: Product):
    # CSV headers as required by the expected output sheet
    headers = [
        "MFR URL", "Ref URL 1", "Ref URL 2", "Ref URL 3", "Ref URL 4", "Ref URL 5",
        "PART_NUMBER", "Dept", "Class", "Fine", "SKU - MY_PART_NUMBER", "Mfg_Part_Num",
        "Part_Desc", "E1_Brand", "Unilog_Brand", "DIB_Brand", "Part_Manuf", "MANUFACTURER_NAME",
        "BRAND_NAME", "TRADE_NAME", "MANUFACTURER_PART_NUMBER", "ALTERNATE_PART_NUMBER",
        "Classpath", "MOBILE_DESC", "INVOICE_DESC", "SHORT_DESC", "LONG_DESC1", "RETAIL_DESC",
        "MARKETING_DESCRIPTION", "ITEM_FEATURES_1", "ITEM_FEATURES_2", "ITEM_FEATURES_3",
        "ITEM_FEATURES_4", "ITEM_FEATURES_5", "ITEM_FEATURES_6", "ITEM_FEATURES_7",
        "ITEM_FEATURES_8", "ITEM_FEATURES_9", "ITEM_FEATURES_10", "ITEM_FEATURES_11",
        "ITEM_FEATURES_12", "ITEM_FEATURES_13", "ITEM_FEATURES_14", "ITEM_FEATURES_15",
        "ITEM_FEATURES_16", "ITEM_FEATURES_17", "ITEM_FEATURES_18", "ITEM_FEATURES_19",
        "ITEM_FEATURES_20", "With", "Standard/Approvals", "Prop 65", "Application",
        "Includes", "Product Name"
    ]
    
    # Add ATTRIBUTE_LABEL/VALUE/UOM for 50 attributes
    for i in range(1, 51):
        headers.extend([f"ATTRIBUTE_LABEL {i}", f"ATTRIBUTE_VALUE {i}", f"ATTRIBUTE_UOM {i}"])
        
    headers.extend([
        "UPC", "EAN", "GTIN", "UNSPSC", "Warranty", "List Price", "Selling Qty", "Selling UOM",
        "Standard Packaging Information", "LENGTH", "LENGTH_UOM", "HEIGHT", "HEIGHT_UOM",
        "WIDTH", "WIDTH_UOM", "WEIGHT", "WEIGHT_UOM", "VOLUME", "VOLUME_UOM", "Product Image",
        "Alternate Image 1", "Alternate Image 2", "Alternate Image 3", "Alternate Image 4",
        "SDS", "SDS_1", "Warranty Information", "Catalog", "Specification Sheet",
        "Instruction/Installation Manual", "Service Manual", "Owners/User Manual",
        "Line Drawing", "MTR", "RoHS", "Full Engineering Drawing", "Energy Star Guide",
        "Technical Bulletin", "Submittal", "Compatibility Chart", "Size Chart",
        "Product Label/Insert", "Video Link", "Video Link 1", "Country Of Origin",
        "Discontinued", "Actual Image (Yes/No)"
    ])
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    
    # Create an empty row
    row = {h: "" for h in headers}
    
    # Fill in basic info
    row["Mfg_Part_Num"] = product.mpn
    row["MANUFACTURER_PART_NUMBER"] = product.mpn
    row["BRAND_NAME"] = product.brand
    row["Part_Desc"] = product.description
    
    # Fill in extracted attributes
    for idx, attr in enumerate(product.attributes):
        if idx >= 50:
            break
        i = idx + 1
        row[f"ATTRIBUTE_LABEL {i}"] = attr.name
        row[f"ATTRIBUTE_VALUE {i}"] = attr.value
        # UOM could be extracted if we parse it, but for now leave blank
        
    writer.writerow([row[h] for h in headers])
    return output.getvalue()
