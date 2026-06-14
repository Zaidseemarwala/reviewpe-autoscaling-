import os
import qrcode



def generate_qr_code(reviewpe_business_id: str):

    os.makedirs("static/qrcodes", exist_ok=True)

    profile_url = (
    f"http://localhost:5173/business/"
    f"{reviewpe_business_id}"
)

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=5
    )

    qr.add_data(profile_url)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white"
    )

    file_path = (
        f"static/qrcodes/"
        f"{reviewpe_business_id}.png"
    )

    image.save(file_path)

    return file_path