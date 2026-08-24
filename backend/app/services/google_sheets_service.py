from datetime import datetime

import gspread
from google.oauth2.service_account import Credentials

from app.config import settings
from app.models.contact import Contact


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


EXPECTED_HEADERS = [
    "Name",
    "Company Name",
    "Designation",
    "Mobile Numbers",
    "Email Addresses",
    "Website",
    "Address",
    "LinkedIn",
    "Other Details",
    "Scanned At"
]


def get_worksheet():

    credentials = Credentials.from_service_account_file(
        settings.GOOGLE_CREDENTIALS_PATH,
        scopes=SCOPES
    )

    client = gspread.authorize(credentials)

    spreadsheet = client.open_by_key(
        settings.GOOGLE_SHEET_ID
    )

    return spreadsheet.sheet1


def safe_text(value) -> str:
    """
    Convert any value into safe plain text for Google Sheets.
    Prevents phone numbers and other values from being
    interpreted as formulas.
    """

    if value is None:
        return ""

    if isinstance(value, list):
        value = ", ".join(
            safe_text(item)
            for item in value
            if item is not None
        )

    value = str(value)

    # Remove null characters and normalize line breaks
    value = value.replace("\x00", "")
    value = value.replace("\r\n", " ")
    value = value.replace("\n", " ")

    # Prefix apostrophe if Sheets may interpret it as a formula.
    if value.startswith("="):
        value = "'" + value

    return value.strip()


def ensure_headers(worksheet):

    current_headers = worksheet.row_values(1)

    if current_headers != EXPECTED_HEADERS:

        worksheet.update(
            range_name="A1:J1",
            values=[EXPECTED_HEADERS],
            value_input_option="RAW"
        )


def save_contact_to_sheet(contact: Contact):

    worksheet = get_worksheet()

    # Make sure the sheet always has the correct structure
    ensure_headers(worksheet)

    row = [
        safe_text(contact.name),
        safe_text(contact.company_name),
        safe_text(contact.designation),
        safe_text(contact.mobile_numbers),
        safe_text(contact.email_addresses),
        safe_text(contact.website),
        safe_text(contact.address),
        safe_text(contact.linkedin),
        safe_text(contact.other_details),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ]

    # Safety check: must always have exactly 10 columns
    if len(row) != 10:
        raise ValueError(
            f"Invalid row length. Expected 10 columns, got {len(row)}"
        )

    worksheet.append_row(
        row,
        value_input_option="RAW"
    )

    return True