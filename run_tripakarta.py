import os
import logging
import pandas as pd
from parser.tripakarta import TripakartaParser
from utils.helper import generate_output_filename

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    input_folder = "input/tripakarta"
    output_folder = "output/tripakarta"
    os.makedirs(output_folder, exist_ok=True)
    
    for filename in os.listdir(input_folder):
        if filename.endswith(".pdf"):
            file_path = os.path.join(input_folder, filename)
            logging.info(f"Memproses dokumen: {filename}")
            
            parser = TripakartaParser(file_path)
            dfs = parser.process() # Sekarang ini mengembalikan dictionary
            
            df_sliding = dfs.get("Sliding Scale", pd.DataFrame())
            df_profit = dfs.get("Profit Commission", pd.DataFrame())
            
            if not df_sliding.empty or not df_profit.empty:
                output_filename = generate_output_filename(filename, company_name="Tripakarta")
                output_file_path = os.path.join(output_folder, output_filename)
                
                # Menggunakan ExcelWriter untuk multi-sheet
                with pd.ExcelWriter(output_file_path, engine='openpyxl') as writer:
                    if not df_sliding.empty:
                        df_sliding.to_excel(writer, sheet_name='Sliding Scale', index=False)
                    if not df_profit.empty:
                        df_profit.to_excel(writer, sheet_name='Profit Commission', index=False)
                        
                logging.info(f"Berhasil mengekspor data ke {output_filename}")
            else:
                logging.warning(f"Tidak ada data tabel yang diekstrak dari {filename}")

if __name__ == "__main__":
    main()