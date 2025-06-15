from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException

GOOGLE_CLIENT_ID = "580709266666-e98ajauei8oemf1vmobtbm5k3fvul2uk.apps.googleusercontent.com"

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")