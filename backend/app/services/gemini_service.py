import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.models.contact import Contact
from app.services.contact_cleaner import clean_contact


# ========================================
# LOAD ENVIRONMENT VARIABLES
# ========================================

# backend/app/services/gemini_service.py
# Go up:
# services -> app -> backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent

ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)


# ========================================
# GEMINI CONFIGURATION
# ========================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not set. "
        f"Expected .env file at: {ENV_PATH}"
    )


# You can change the model from .env
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash"
)


# Create Gemini client
client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ========================================
# FAST EXTRACTION PROMPT
# ========================================

EXTRACTION_PROMPT = """
Extract contact information from the provided visiting card image or images.

The card may contain English, Telugu, or a mixture of multiple languages.

If two images are provided, they are the front and back sides of the SAME
visiting card. Combine the information from both sides into one contact.

Return ONLY information that is actually visible on the visiting card.

EXTRACTION RULES:

1. Extract the person's full name.
2. Extract the company or organization name.
3. Extract the designation, role, or job title.
4. Extract all mobile, phone, landline, WhatsApp, or contact numbers.
5. Extract all email addresses.
6. Extract the website if present.
7. Extract the complete address if present.
8. Extract the LinkedIn URL or LinkedIn information if present.
9. Put any other useful information into other_details.
10. Do not invent, guess, or hallucinate missing information.
11. If the same information appears on both sides, include it only once.
12. Preserve the original spelling of names and company names.
13. Understand Telugu text and translate field labels when necessary.
14. Preserve names, addresses, company names, phone numbers,
    email addresses, and websites accurately.
15. For missing text fields, return null.
16. For missing mobile_numbers, return an empty list.
17. For missing email_addresses, return an empty list.
18. Do not combine two different fields incorrectly.
19. Keep the complete address as a single address value.
20. Do not place address fragments into other fields.
21. Return structured contact data only.

This is a strict data extraction task.
Be concise and accurate.
"""


# ========================================
# EXTRACT CARD DETAILS
# ========================================

def extract_card_details(
    side1_bytes: bytes,
    side1_mime_type: str,
    side2_bytes: bytes | None = None,
    side2_mime_type: str | None = None
) -> Contact:

    # ====================================
    # CREATE SIDE 1 IMAGE
    # ====================================

    side1_image = types.Part.from_bytes(
        data=side1_bytes,
        mime_type=side1_mime_type
    )

    contents = [
        EXTRACTION_PROMPT,
        "CARD SIDE 1:",
        side1_image
    ]


    # ====================================
    # ADD SIDE 2 IF AVAILABLE
    # ====================================

    if side2_bytes and side2_mime_type:

        side2_image = types.Part.from_bytes(
            data=side2_bytes,
            mime_type=side2_mime_type
        )

        contents.extend([
            "CARD SIDE 2:",
            "This is the back side of the same visiting card.",
            "Merge information from both sides and remove duplicates.",
            side2_image
        ])


    # ====================================
    # GEMINI REQUEST
    # ====================================

    try:

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(

                # Force JSON response
                response_mime_type="application/json",

                # Force response to match Contact model
                response_schema=Contact,

                # Low temperature for accurate extraction
                temperature=0.1,

                # Limit unnecessary output
                max_output_tokens=2048
            )
        )

    except Exception as error:

        print("\nGEMINI REQUEST ERROR:")
        print(str(error))
        print()

        raise RuntimeError(
            f"Gemini API request failed: {str(error)}"
        )


    # ====================================
    # DEBUG RAW RESPONSE
    # ====================================

    print("\n" + "=" * 50)
    print("RAW GEMINI RESPONSE")
    print("=" * 50)

    print(response.text)

    print("=" * 50 + "\n")


    # ====================================
    # VALIDATE RESPONSE
    # ====================================

    if not response.text and not response.parsed:

        raise ValueError(
            "Gemini returned an empty response."
        )


    # ====================================
    # USE PARSED RESPONSE
    # ====================================

    try:

        if response.parsed:

            # Sometimes SDK directly returns Contact
            if isinstance(response.parsed, Contact):

                contact = response.parsed

            else:

                contact = Contact.model_validate(
                    response.parsed
                )

        else:

            # Fallback JSON parsing
            contact = Contact.model_validate_json(
                response.text
            )

    except Exception as error:

        print("\nCONTACT PARSING ERROR:")
        print(str(error))

        print("\nRAW RESPONSE:")
        print(response.text)

        raise ValueError(
            f"Failed to parse Gemini response: {str(error)}"
        )


    # ====================================
    # CLEAN + REMOVE DUPLICATES
    # ====================================

    contact = clean_contact(contact)


    # ====================================
    # FINAL DEBUG OUTPUT
    # ====================================

    print("\nFINAL CLEAN CONTACT:")

    print(
        contact.model_dump()
    )

    print()


    return contact