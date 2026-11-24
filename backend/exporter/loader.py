import os
import logging
import pandas as pd
from datetime import datetime
from utils.helpers import generate_output_filename, clean_filename_string
from utils.excel_exporter import format_excel_sheet

# Konfigurasi direktori penyimpanan hasil ekspor Excel (folder exports di root backend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "exports")
os.makedirs(OUTPUT_DIR, exist_ok=True)


class ExcelLoader:
    def __init__(self, output_dir: str = OUTPUT_DIR):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def save_to_excel(
        self, 
        data_frames: dict, 
        input_filename: str, 
        company_name: str
    ) -> str:
        """
        Menyimpan dictionary DataFrame menjadi berkas Excel (.xlsx) multi-sheet
        dan menerapkan formatting tampilan rapi via utils.excel_exporter.
        
        :param data_frames: Dict berformat {'Sliding Scale': df1, 'Profit Commission': df2}
        :param input_filename: Nama file PDF asli yang diunggah
        :param company_name: Nama perusahaan / Reinsured hasil ekstraksi header
        :return: Absolute file path lokasi berkas Excel disimpan
        """
        # 1. Hasilkan nama berkas Excel dinamis via helpers
        excel_filename = generate_output_filename(input_filename, company_name)
        full_output_path = os.path.join(self.output_dir, excel_filename)

        try:
            # 2. Tulis setiap DataFrame ke sheet yang sesuai memakai engine openpyxl
            with pd.ExcelWriter(full_output_path, engine="openpyxl") as writer:
                has_data = False
                for sheet_name, df in data_frames.items():
                    if isinstance(df, pd.DataFrame) and not df.empty:
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                        has_data = True
                    else:
                        # Jika DataFrame kosong, buat sheet dengan pesan informasi
                        pd.DataFrame(
                            [{"Status": "Data tidak ditemukan pada dokumen"}]
                        ).to_excel(writer, sheet_name=sheet_name, index=False)

            # 3. Terapkan pemformatan visual (header emerald, border, auto-fit width)
            format_excel_sheet(full_output_path)

            logging.info(f"Berhasil menyimpan hasil ekspor Excel: {full_output_path}")
            return full_output_path

        except Exception as e:
            logging.error(f"Gagal menyimpan berkas Excel {full_output_path}: {e}")
            raise e

    def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Menghapus berkas sementara di folder exports yang usianya sudah melebihi max_age_hours.
        """
        now = datetime.now()
        for filename in os.listdir(self.output_dir):
            file_path = os.path.join(self.output_dir, filename)
            if os.path.isfile(file_path):
                file_age = now - datetime.fromtimestamp(os.path.getmtime(file_path))
                if file_age.total_seconds() > max_age_hours * 3600:
                    try:
                        os.remove(file_path)
                        logging.info(f"Menghapus berkas lama: {filename}")
                    except Exception as e:
                        logging.error(f"Gagal menghapus berkas {filename}: {e}")