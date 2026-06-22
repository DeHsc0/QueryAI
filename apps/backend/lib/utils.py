from cryptography.fernet import Fernet
import os , json
from schemas import Database_Creation

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if ENCRYPTION_KEY is None:
    raise ValueError("ENCRYPTION_KEY environment variable is not set")

fernet = Fernet(ENCRYPTION_KEY)

def encrypt_credentials ( credentials_dict : Database_Creation ): 

    encrypted_creds = fernet.encrypt( json.dumps(credentials_dict.model_dump()).encode() )    
    
    return encrypted_creds.decode()


def decrypt_credentials ( encrypted_creds : str ):
    
    decrypted_texts = fernet.decrypt( encrypted_creds )
    
    return decrypted_texts