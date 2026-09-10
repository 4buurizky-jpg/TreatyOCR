from abc import ABC, abstractmethod
import pandas as pd
import os

class BaseParser(ABC):
    def __init__(self, file_path):
        self.file_path = file_path
        self.file_name = os.path.basename(file_path)
        self.text_content = ""

    @abstractmethod
    def extract_text(self):
        """Membaca PDF (bisa menggunakan pdfplumber/fitz atau fallback ke OCR)"""
        pass

    @abstractmethod
    def parse_headers(self):
        """Mengekstrak header global seperti Reinsured dan Type"""
        pass

    @abstractmethod
    def parse_tables(self, headers):
        """Mengekstrak tabel spesifik dan menggabungkannya dengan header"""
        pass

    def process(self):
        """Alur utama (Data Flow) yang dipanggil oleh script runner"""
        self.extract_text()
        headers = self.parse_headers()
        df = self.parse_tables(headers)
        return df