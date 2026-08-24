from io import BytesIO
from PIL import Image


def optimize_image(
    image_bytes: bytes,
    max_size: int = 1600,
    quality: int = 85
) -> bytes:

    image = Image.open(
        BytesIO(image_bytes)
    )

    # Convert unsupported formats to RGB
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    # Reduce large camera images
    image.thumbnail(
        (max_size, max_size)
    )

    output = BytesIO()

    image.save(
        output,
        format="JPEG",
        quality=quality,
        optimize=True
    )

    return output.getvalue()