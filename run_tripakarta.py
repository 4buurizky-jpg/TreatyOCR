import logging
import os
import openpyxl
from openpyxl.styles import Border, Font, Side
import pandas as pd
from parser.tripakarta import TripakartaParser
from utils.helper import generate_output_filename

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

def main():
  input_folder = "input/tripakarta"
  output_folder = "output/tripakarta"
  os.makedirs(output_folder, exist_ok=True)

  for filename in os.listdir(input_folder):
    if filename.endswith(".pdf"):
      file_path = os.path.join(input_folder, filename)
      logging.info(f"Memproses dokumen: {filename}")

      parser = TripakartaParser(file_path)
      dfs = parser.process()  # Mengembalikan dictionary berisi DataFrame

      df_sliding = dfs.get("Sliding Scale", pd.DataFrame())
      df_profit = dfs.get("Profit Commission", pd.DataFrame())

      if not df_sliding.empty or not df_profit.empty:
        output_filename = generate_output_filename(
            filename, company_name="Tripakarta"
        )
        output_file_path = os.path.join(output_folder, output_filename)

        # Menggunakan ExcelWriter untuk multi-sheet
        with pd.ExcelWriter(output_file_path, engine="openpyxl") as writer:
          if not df_sliding.empty:
            df_sliding.to_excel(
                writer, sheet_name="Sliding Scale", index=False
            )
          if not df_profit.empty:
            df_profit.to_excel(
                writer, sheet_name="Profit Commission", index=False
            )

          # Formatting: Menghapus cetak tebal (bold) dan border garis pada header baris ke-1
          normal_font = Font(bold=False)
          no_border = Border(
              left=Side(style=None),
              right=Side(style=None),
              top=Side(style=None),
              bottom=Side(style=None),
          )

          for sheet_name in writer.sheets:
            ws = writer.sheets[sheet_name]
            for cell in ws[1]:  # ws[1] adalah baris header
              cell.font = normal_font
              cell.border = no_border

        logging.info(f"Berhasil mengekspor data ke {output_filename}")
      else:
        logging.warning(
            f"Tidak ada data tabel yang diekstrak dari {filename}"
        )


if __name__ == "__main__":
  main()