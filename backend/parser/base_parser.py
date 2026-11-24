from abc import ABC, abstractmethod
import os
import pandas as pd


class BaseParser(ABC):
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.file_name = os.path.basename(file_path)
        self.text_content = ""

    @abstractmethod
    def extract_text(self):
        """Membaca teks dari dokumen PDF (pdfplumber/fitz/OCR)."""
        pass

    @abstractmethod
    def parse_headers() -> dict:
        """Mengekstrak metadata/header global dari PDF."""
        pass

    @abstractmethod
    def parse_sliding_scale(self, headers: dict) -> pd.DataFrame:
        """Mengekstrak tabel Sliding Scale."""
        pass

    @abstractmethod
    def parse_profit_commission(self, headers: dict) -> pd.DataFrame:
        """Mengekstrak tabel Profit Commission."""
        pass

    def process() -> dict:
        """
        Alur pemrosesan utama.
        Mengembalikan dictionary berisi DataFrame 'Sliding Scale' dan 'Profit Commission'.
        """
        self.extract_text()
        headers = self.parse_headers()

        df_sliding = self.parse_sliding_scale(headers)
        df_profit = self.parse_profit_commission(headers)

        return {
            "Sliding Scale": df_sliding,
            "Profit Commission": df_profit
        }