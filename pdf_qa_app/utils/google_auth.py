from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException
from email_whitelist import get_allowed_emails
GOOGLE_CLIENT_ID = "580709266666-e98ajauei8oemf1vmobtbm5k3fvul2uk.apps.googleusercontent.com"

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get("email")
        # ----- YAHAN CHECK KARO -----
        allowed_emails = get_allowed_emails()
        if email not in allowed_emails:
            raise HTTPException(status_code=403, detail="Your email is not allowed for this demo.")
        # ----------------------------
        return idinfo
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")