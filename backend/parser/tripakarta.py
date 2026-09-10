import re
import pandas as pd
import logging
from parser.base_parser import BaseParser
from utils.pdf_reader import read_pdf_text
from schemas.commission import CommissionRecord, ProfitCommissionRecord
from pydantic import ValidationError

class TripakartaParser(BaseParser):
    def extract_text(self):
        self.text_content = read_pdf_text(self.file_path)

    def parse_headers(self):
        reinsured_match = re.search(r"REINSURED\s*:\s*(.+)", self.text_content, re.IGNORECASE)
        type_match = re.search(r"TYPE\s*:\s*(.+)", self.text_content, re.IGNORECASE)
        
        return {
            "Reinsured": reinsured_match.group(1).strip() if reinsured_match else "PT Asuransi Tri Pakarta",
            "Type_COB": type_match.group(1).strip() if type_match else "Whole Account Quota Share"
        }

    def parse_sliding_scale(self, headers):
        valid_records = []
        section_match = re.search(r"Applicable for Section (\d+)", self.text_content, re.IGNORECASE)
        section = section_match.group(1) if section_match else "1"
        
        # Regex diperkuat: Mencari angka komisi meskipun ada kata/karakter aneh di antaranya
        provision_match = re.search(r"Provision R/I Commission.*?(\d+(?:\.\d+)?)%", self.text_content, re.IGNORECASE)
        
        if provision_match:
            provision_comm = provision_match.group(1)
            # Mulai pemotongan teks tepat di lokasi regex ditemukan
            table_start = provision_match.start()
            table_block = self.text_content[table_start:].split("\n")
            
            in_table = False
            for line in table_block:
                clean_line = re.sub(r'\s+', ' ', line.replace('%', '').strip())
                parts = clean_line.split(' ')
                
                is_valid_row = len(parts) >= 3 and (parts[0].replace('.', '', 1).isdigit() or parts[0] in ['<', '>'])
                
                if is_valid_row:
                    in_table = True
                    bottom_lr, upper_lr = "", ""
                    ri_comm = parts[-1]
                    
                    if ">" in parts:
                        bottom_lr = parts[0]
                    elif "<" in parts:
                        upper_lr = parts[1]
                    else:
                        bottom_lr = parts[0]
                        upper_lr = parts[1]
                        
                    try:
                        record = CommissionRecord(
                            Reinsured=headers["Reinsured"],
                            Type_COB=headers["Type_COB"],
                            Section=section,
                            Provision_Commission=provision_comm,
                            Bottom_LR=bottom_lr,
                            Upper_LR=upper_lr,
                            RI_Commission=ri_comm
                        )
                        valid_records.append(record.model_dump())
                    except ValidationError:
                        pass
                
                elif in_table:
                    break 
                    
        return pd.DataFrame(valid_records)

    def parse_profit_commission(self, headers):
        valid_records = []
        
        cob_mapping = {}
        section_matches = re.finditer(r"Section\s+(\d+)\s*[-–]\s*([A-Za-z\s]+?)\s*:", self.text_content, re.IGNORECASE)
        for match in section_matches:
            cob_mapping[match.group(1).strip()] = match.group(2).strip()
            
        default_cobs = {"1": "Fire", "2": "Engineering", "3": "General Accident", "4": "Marine Cargo", "5": "Money Insurance"}
        for k, v in default_cobs.items():
            if k not in cob_mapping:
                cob_mapping[k] = v

        profit_match = re.search(r"PROFIT\s*COMMISSION", self.text_content, re.IGNORECASE)
        
        if not profit_match:
            logging.warning("GAGAL: Kata 'PROFIT COMMISSION' tidak ditemukan di teks dokumen.")
            return pd.DataFrame()
            
        profit_start = profit_match.start()
        profit_block = self.text_content[profit_start:profit_start+1500]
        
        # MENGGUNAKAN FINDITER: Agar tidak berhenti di Section 1
        section_iter = re.finditer(r"Section\s*([0-9\s,]+)\s*:", profit_block, re.IGNORECASE)
        found_any_section = False
        
        subject_match = re.search(r"(\d+(?:\.\d+)?%)\s+for\s+all", profit_block, re.IGNORECASE)
        expenses_match = re.search(r"subject\s+to\s+(\d+(?:\.\d+)?%)\s+Management", profit_block, re.IGNORECASE)
        deficit_match = re.search(r"and\s+(\d+)\s+\([a-zA-Z]+\)\s+year\s+Deficit", profit_block, re.IGNORECASE)
        
        subject_val = subject_match.group(1) if subject_match else "10%"
        expenses_val = expenses_match.group(1) if expenses_match else "10%"
        deficit_val = deficit_match.group(1) if deficit_match else "5"
        
        for sec_match in section_iter:
            found_any_section = True
            sections_raw = sec_match.group(1).replace(' ', '')
            target_sections = sections_raw.split(',')
            
            for sec in target_sections:
                sec = sec.strip()
                if not sec or sec == '1': 
                    continue
                
                try:
                    record = ProfitCommissionRecord(
                        Cedant=headers["Reinsured"],
                        Type=headers["Type_COB"],
                        Case="PROFIT COMMISSION",
                        Section=sec,
                        COB=cob_mapping.get(sec, "Unknown COB"),
                        Subject=subject_val,
                        Expenses=expenses_val,
                        Deficit_Clause_Year=deficit_val
                    )
                    valid_records.append(record.model_dump())
                except ValidationError as e:
                    logging.warning(f"Error validasi Profit Commission pada section {sec}: {e}")
                    
        if not found_any_section:
            logging.warning("GAGAL: Pola 'Section X :' tidak ditemukan di bawah Profit Commission.")
                
        return pd.DataFrame(valid_records)

    def process(self):
        self.extract_text()
        headers = self.parse_headers()
        
        df_sliding = self.parse_sliding_scale(headers)
        df_profit = self.parse_profit_commission(headers)
        
        return {
            "Sliding Scale": df_sliding,
            "Profit Commission": df_profit
        }

    def parse_tables(self, headers): 
        pass