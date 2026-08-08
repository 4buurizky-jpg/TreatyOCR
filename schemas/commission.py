from pydantic import BaseModel, field_validator
from typing import Optional

class CommissionRecord(BaseModel):
    Reinsured: str
    Type_COB: str
    Section: str
    Provision_Commission: float
    Bottom_LR: Optional[float] = None
    Upper_LR: Optional[float] = None
    RI_Commission: float

    @field_validator('Provision_Commission', 'Bottom_LR', 'Upper_LR', 'RI_Commission', mode='before')
    @classmethod
    def clean_and_convert_floats(cls, value):
        if value is None or str(value).strip() == '': return None
        val_str = str(value).strip()
        if val_str in ['<', '>']: return None
        try:
            return float(val_str)
        except ValueError:
            raise ValueError(f"Gagal mengonversi '{val_str}' menjadi angka (float).")

class ProfitCommissionRecord(BaseModel):
    Cedant: str
    Type: str
    Case: str
    Section: str
    COB: str
    Subject: str
    Expenses: str
    Deficit_Clause_Year: str  # Disesuaikan dengan header Excel