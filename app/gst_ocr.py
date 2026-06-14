import easyocr
import re

reader = easyocr.Reader(['en'])

def extract_gst_details(image_path):

    results = reader.readtext(image_path)

    extracted_text = ""

    for item in results:
        extracted_text += item[1] + "\n"

    print("\n========== OCR TEXT ==========")
    print(extracted_text)
    print("==============================\n")

    # GST Number

    gst_match = re.search(
        r'[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]{3}',
        extracted_text
    )

    if not gst_match:
        gst_match = re.search(
            r'[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]{3}',
            extracted_text
        )

    gst_number = (
        gst_match.group(0)
        if gst_match
        else None
    )

    # Business Name

    business_name = None

    lines = extracted_text.split("\n")

    for line in lines:

        line = line.strip()

        if (
            len(line) > 5
            and line.isupper()
            and "GST" not in line
            and "INVOICE" not in line
            and "TAX" not in line
        ):
            business_name = line
            break

    # Address Extraction

    address_keywords = [
        "address",
        "addr",
        "location"
    ]

    gst_address = ""

    for i, line in enumerate(lines):

        lower_line = line.lower()

        if any(
            keyword in lower_line
            for keyword in address_keywords
        ):

            gst_address += line + " "

            if i + 1 < len(lines):
                gst_address += lines[i + 1] + " "

            if i + 2 < len(lines):
                gst_address += lines[i + 2]

            break

    return {
        "gst_number": gst_number,
        "business_name": business_name,
        "gst_address": gst_address.strip(),
        "raw_text": extracted_text
    }