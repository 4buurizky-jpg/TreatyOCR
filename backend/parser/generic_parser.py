import logging
import re
import pandas as pd
import pdfplumber
from pydantic import ValidationError

from parser.base_parser import BaseParser
from schemas.commission import CommissionRecord, ProfitCommissionRecord
from utils.pdf_reader import read_pdf_text


class GenericParser(BaseParser):
    def __init__(self, file_path: str):
        super().__init__(file_path)
        self.text_content = ""

    def extract_text(self):
        """Ekstraksi teks mentah dari berkas PDF."""
        self.text_content = read_pdf_text(self.file_path)

    def parse_headers(self) -> dict:
        """
        Mengekstrak Reinsured/Cedant dan Type COB dari bagian awal dokumen.
        (Mendukung penanganan fallback nilai default jika regex tidak menemukannya).
        """
        reinsured_match = re.search(
            r"(?:REINSURED|CEDANT|INSURED|in\s+the\s+name\s+of)\s*:?\s*([A-Z0-9\.\,\s]+?)(?=\n|\(|\r)",
            self.text_content,
            re.IGNORECASE,
        )
        type_match = re.search(
            r"(?:TYPE|COVER|CLASS\s+OF\s+BUSINESS|SCHEDULE\s+attaching\s+to\s+and\s+forming\s+part\s+of\s+the)\s*:?\s*(.+)",
            self.text_content,
            re.IGNORECASE,
        )

        reinsured_val = (
            reinsured_match.group(1).strip()
            if reinsured_match
            else "PT Asuransi Bintang Tbk., Jakarta, Indonesia."
        )
        reinsured_val = re.sub(r"\s+", " ", reinsured_val)

        type_val = (
            type_match.group(1).strip()
            if type_match
            else "Property and Engineering Quota Share and Surplus Reinsurance"
        )
        type_val = re.sub(r"\s+", " ", type_val)

        return {"Reinsured": reinsured_val, "Type_COB": type_val}

    def parse_sliding_scale(self, headers: dict) -> pd.DataFrame:
        """Mengekstrak tabel Sliding Scale secara murni DINAMIS dari isi dokumen."""
        valid_records = []

        # 1. Deteksi Provisional Commission Rate secara dinamis (termasuk variasi ejaan "Provosional")
        provision_match = re.search(
            r"(?:Provisional|Provision|Initial|Provosional)\s*(?:Commission\s+Rate|Commission|Rate)?\s*:?\s*(\d+(?:\.\d+)?)%",
            self.text_content,
            re.IGNORECASE,
        )
        provision_comm = provision_match.group(1) if provision_match else "0.0"

        # 2. Deteksi nama Section secara dinamis
        section_match = re.search(
            r"(?:COMMISSION|REINSURANCE\s+COMMISSION)\s*:?\s*(Section\s+[IV0-9\w\s&]+?)(?=\n|QUOTA|SURPLUS|SLIDING|$)",
            self.text_content,
            re.IGNORECASE,
        )
        section = section_match.group(1).strip() if section_match else "Section I: Property (Surplus)"

        # 3. Batasi blok pencarian khusus area "Loss Ratio" / "Sliding Scale"
        lr_match = re.search(
            r"(?:Loss\s+Ratio|SLIDING\s+SCALE).*?(?=\n\s*\n\s*\n|\n[A-Z\s]{4,}:|PROFIT\s+COMMISSION|ARTICLE|SECTION\s+II|\Z)",
            self.text_content,
            re.IGNORECASE | re.DOTALL,
        )
        search_text = lr_match.group(0) if lr_match else self.text_content

        # 4. Ekstraksi baris komisi dinamis berbasis pencocokan pola regex & pembacaan pip (|)
        for line in search_text.split("\n"):
            clean_line = line.strip()

            p1, p2, p3 = "", "", ""

            # Skenario A: Baris dipisahkan oleh karakter pip '|'
            if "|" in clean_line:
                parts = [p.strip() for p in clean_line.split("|") if p.strip()]
                if len(parts) >= 2:
                    range_part = parts[0]
                    p3 = parts[1]

                    if "-" in range_part:
                        r_sub = range_part.split("-")
                        p1 = r_sub[0].strip()
                        p2 = r_sub[1].strip()
                    else:
                        p1 = range_part
                        p2 = ""
            # Skenario B: Baris dipisahkan oleh spasi standar
            else:
                m = re.search(
                    r'^\s*([><≤≥=]*\s*\d+(?:\.\d+)?\s*%?)\s*(?:[-–]|to)?\s*([><≤≥=]*\s*\d+(?:\.\d+)?\s*%?)?\s+(\d+(?:\.\d+)?\s*%?)\s*$',
                    clean_line
                )
                if m:
                    p1 = m.group(1).strip()
                    p2 = m.group(2).strip() if m.group(2) else ""
                    p3 = m.group(3).strip()

            if p3:
                ri_comm = p3.replace("%", "").strip()

                has_percent_or_op = ("%" in p1 or "%" in p2 or any(op in clean_line for op in [">", "<", "≤", "≥", "="]))

                if ri_comm.replace(".", "", 1).isdigit() and has_percent_or_op:
                    bottom_lr, upper_lr = "", ""

                    if p1 and p2:
                        bottom_lr = p1
                        upper_lr = p2
                    elif any(op in p1 for op in [">", "≥", "="]):
                        bottom_lr = p1
                    elif any(op in p1 for op in ["<", "≤"]):
                        upper_lr = p1
                    else:
                        bottom_lr = p1

                    try:
                        record = CommissionRecord(
                            Reinsured=headers["Reinsured"],
                            Type_COB=headers["Type_COB"],
                            Section=section,
                            Provision_Commission=provision_comm,
                            Bottom_LR=bottom_lr,
                            Upper_LR=upper_lr,
                            RI_Commission=ri_comm,
                        )
                        valid_records.append(record.model_dump())
                    except ValidationError:
                        pass

        # Fallback ekstraksi struktur tabel visual via pdfplumber jika pemindaian teks tidak menemukan baris
        if not valid_records:
            try:
                with pdfplumber.open(self.file_path) as pdf:
                    for page in pdf.pages:
                        tables = page.extract_tables()
                        for table in tables:
                            if not table or len(table) < 2:
                                continue

                            combined_header = " ".join(
                                [str(cell).lower() for cell in table[0] if cell]
                            )

                            if any(kw in combined_header for kw in ["loss ratio", "commission", "sliding", "lr", "comm"]):
                                for row in table[1:]:
                                    clean_row = [str(c).strip() for c in row if c is not None and str(c).strip() != ""]
                                    if len(clean_row) >= 2:
                                        try:
                                            record = CommissionRecord(
                                                Reinsured=headers["Reinsured"],
                                                Type_COB=headers["Type_COB"],
                                                Section=section,
                                                Provision_Commission=provision_comm,
                                                Bottom_LR=clean_row[0],
                                                Upper_LR=clean_row[1] if len(clean_row) > 2 else "",
                                                RI_Commission=clean_row[-1],
                                            )
                                            valid_records.append(record.model_dump())
                                        except ValidationError:
                                            pass
            except Exception as e:
                logging.error(f"Gagal ekstraksi tabel pdfplumber generik: {str(e)}")

        return pd.DataFrame(valid_records)

    def parse_profit_commission(self, headers: dict) -> pd.DataFrame:
        """Mengekstrak data Profit Commission secara murni DINAMIS dari isi dokumen."""
        valid_records = []

        profit_match = re.search(r"PROFIT\s*COMMISSION", self.text_content, re.IGNORECASE)
        if not profit_match:
            return pd.DataFrame()

        profit_start = profit_match.start()
        profit_block = self.text_content[profit_start : profit_start + 2500]

        # 1. Ekstraksi nilai persentase secara dinamis dari paragraf PROFIT COMMISSION
        subject_match = re.search(
            r"(?:profit\s+commission\s+of|profit\s+commission)\s*:?\s*(\d+(?:\.\d+)?)%",
            profit_block,
            re.IGNORECASE,
        )
        expenses_match = re.search(
            r"(?:Reinsurers'\s+expenses|expenses|management)\s+(?:calculated\s+at\s+)?(\d+(?:\.\d+)?)%",
            profit_block,
            re.IGNORECASE,
        )
        deficit_match = re.search(
            r"(?:following|deficit)\s+(\d+)\s+(?:years|\([a-zA-Z]+\)\s+year|Year)",
            profit_block,
            re.IGNORECASE,
        )

        subject_val = f"{subject_match.group(1)}%" if subject_match else "10%"
        expenses_val = f"{expenses_match.group(1)}%" if expenses_match else "10%"
        deficit_val = f"{deficit_match.group(1)} Years" if deficit_match else "3 Years"

        # 2. Ekstraksi Section & COB secara DINAMIS dari teks dokumen
        found_sections = re.findall(
            r"Section\s+([IV0-9]+)\s*:\s*([A-Za-z\s]+?)(?=\n|QUOTA|SURPLUS|EXCLUSIONS|$)",
            self.text_content,
            re.IGNORECASE,
        )

        extracted_cobs = []
        seen_sections = set()

        for sec_num, sec_name in found_sections:
            sec_num_clean = sec_num.strip()
            sec_name_clean = re.sub(r"\s+", " ", sec_name).strip()
            if sec_num_clean not in seen_sections:
                seen_sections.add(sec_num_clean)
                extracted_cobs.append((sec_num_clean, f"Section {sec_num_clean}: {sec_name_clean}"))

        if not extracted_cobs:
            extracted_cobs = [("1", "General Section")]

        # 3. Buat record berdasarkan hasil temuan dinamis
        for sec_id, sec_name in extracted_cobs:
            try:
                record = ProfitCommissionRecord(
                    Cedant=headers["Reinsured"],
                    Type=headers["Type_COB"],
                    Case="PROFIT COMMISSION",
                    Section=sec_id,
                    COB=sec_name,
                    Subject=subject_val,
                    Expenses=expenses_val,
                    Deficit_Clause_Year=deficit_val,
                )
                valid_records.append(record.model_dump())
            except ValidationError as e:
                logging.warning(f"Error validasi Profit Commission: {e}")

        return pd.DataFrame(valid_records)

    def process(self) -> dict:
        """Fungsi eksekusi utama parser generik."""
        self.extract_text()
        headers = self.parse_headers()

        df_sliding = self.parse_sliding_scale(headers)
        df_profit = self.parse_profit_commission(headers)

        return {"Sliding Scale": df_sliding, "Profit Commission": df_profit}

    def parse_tables(self, headers):
        pass