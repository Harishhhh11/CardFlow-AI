from fastapi import APIRouter, HTTPException

from app.models.contact import Contact
from app.services.google_sheets_service import save_contact_to_sheet


router = APIRouter(
    prefix="/api/contacts",
    tags=["Contacts"]
)


@router.post("/save")
async def save_contact(contact: Contact):

    try:

        save_contact_to_sheet(contact)

        return {
            "success": True,
            "message": "Contact saved successfully",
            "data": contact.model_dump()
        }

    except Exception as e:

        print("SAVE ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save contact: {str(e)}"
        )