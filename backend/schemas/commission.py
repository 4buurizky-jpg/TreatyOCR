from pydantic import BaseModel, field_validator
from typing import Optional


class CommissionRecord(BaseModel):
    Reinsured: str
    Type_COB: str
    Section: str
    Provision_Commission: Optional[float] = 0.0
    Bottom_LR: Optional[str] = ""
    Upper_LR: Optional[str] = ""
    RI_Commission: float

    @field_validator('Provision_Commission', 'RI_Commission', mode='before')
    @classmethod
    def clean_and_convert_floats(cls, value):
        """
        Membersihkan simbol persentase ('%') dan spasi sebelum dikonversi ke float.
        """
        if value is None or str(value).strip() in ['', 'None', 'nan', 'NaN']:
            return 0.0
        val_str = str(value).replace('%', '').strip()
        try:
            return float(val_str)
        except ValueError:
            return 0.0

    @field_validator('Bottom_LR', 'Upper_LR', mode='before')
    @classmethod
    def clean_string_ranges(cls, value):
        """
        Memastikan nilai range Loss Ratio (misal: '> 62.0%', '≤ 56.0%') tetap dipertahankan
        sebagai string rapi dan mengembalikan string kosong jika None.
        """
        if value is None or str(value).strip() in ['', 'None', 'nan', 'NaN']:
            return ""
        return str(value).strip()


class ProfitCommissionRecord(BaseModel):
    Cedant: str
    Type: str
    Case: str
    Section: str
    COB: str
    Subject: str
    Expenses: str
    Deficit_Clause_Year: str

    @field_validator('Subject', 'Expenses', 'Deficit_Clause_Year', mode='before')
    @classmethod
    def clean_text_fields(cls, value):
        """
        Memastikan bidang teks pada Profit Commission tidak bernilai None/NaN.
        """
        if value is None or str(value).strip() in ['', 'None', 'nan', 'NaN']:
            return "-"
        return str(value).strip()