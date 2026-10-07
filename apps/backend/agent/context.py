from dataclasses import dataclass
from typing import Optional

@dataclass
class Context: 
    tenant_id : str
    conversation_id : str
    dense_schema : Optional[str]
    db_type : Optional[str]
    encrypted_creds : Optional[str]