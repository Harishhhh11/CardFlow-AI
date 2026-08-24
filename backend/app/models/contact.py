from typing import Optional

from pydantic import BaseModel, Field


class Contact(BaseModel):

    name: Optional[str] = None

    company_name: Optional[str] = None

    designation: Optional[str] = None

    mobile_numbers: list[str] = Field(
        default_factory=list
    )

    email_addresses: list[str] = Field(
        default_factory=list
    )

    website: Optional[str] = None

    address: Optional[str] = None

    linkedin: Optional[str] = None

    other_details: Optional[str] = None