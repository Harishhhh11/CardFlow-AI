import re

from app.models.contact import Contact


def clean_text(value):
    if not value:
        return None

    value = str(value).strip()

    value = re.sub(r"\s+", " ", value)

    return value or None


def normalize_phone(phone: str) -> str:
    """
    Create a normalized version of a phone number
    only for duplicate comparison.
    """

    if not phone:
        return ""

    digits = re.sub(r"\D", "", phone)

    # Remove leading 91 for Indian numbers when comparing
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]

    return digits


def remove_duplicate_phones(numbers: list[str]) -> list[str]:

    unique_numbers = []
    seen = set()

    for number in numbers:

        number = clean_text(number)

        if not number:
            continue

        normalized = normalize_phone(number)

        if normalized and normalized not in seen:
            seen.add(normalized)
            unique_numbers.append(number)

    return unique_numbers


def remove_duplicate_emails(emails: list[str]) -> list[str]:

    unique_emails = []
    seen = set()

    for email in emails:

        email = clean_text(email)

        if not email:
            continue

        normalized = email.lower()

        if normalized not in seen:
            seen.add(normalized)
            unique_emails.append(email)

    return unique_emails


def clean_website(website):

    website = clean_text(website)

    if not website:
        return None

    return website


def clean_contact(contact: Contact) -> Contact:

    contact.name = clean_text(contact.name)
    contact.company_name = clean_text(contact.company_name)
    contact.designation = clean_text(contact.designation)

    contact.mobile_numbers = remove_duplicate_phones(
        contact.mobile_numbers
    )

    contact.email_addresses = remove_duplicate_emails(
        contact.email_addresses
    )

    contact.website = clean_website(contact.website)

    contact.address = clean_text(contact.address)
    contact.linkedin = clean_text(contact.linkedin)
    contact.other_details = clean_text(contact.other_details)

    return contact