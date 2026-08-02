"""
gabungkan_kode.py

Script ini akan membaca SEMUA file kode di dalam sebuah folder project
(termasuk yang ada di dalam sub-folder), lalu menggabungkan isinya
menjadi SATU file teks (misalnya: gabungan_kode.txt).

Formatnya seperti ini:

    path/relatif/file1.js:
    <isi file1.js>

    path/relatif/file2.css:
    <isi file2.css>

Cara pakai ada di bagian bawah file ini (baca komentarnya).
"""

import os

# ======================================================================
# BAGIAN YANG BISA KAMU UBAH (SETTINGAN)
# ======================================================================

# 1. Folder project yang mau digabungkan kodenya.
#    "." artinya "folder tempat script ini berada".
FOLDER_PROJECT = "."

# 2. Nama file hasil gabungan yang akan dibuat.
FILE_OUTPUT = "gabungan_kode.txt"

# 3. Ekstensi file apa saja yang mau dimasukkan.
#    Tambah/kurangi sesuai kebutuhan project kamu.
EKSTENSI_DIIZINKAN = [
    ".js", ".ts", ".jsx", ".tsx",
    ".html", ".css",
    ".json",
    ".py",
    ".md",
]

# 4. Nama folder yang mau DILEWATI (tidak ikut digabung).
#    Biasanya folder hasil install/build tidak perlu ikut.
FOLDER_DILEWATI = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__",
]

# ======================================================================
# BAGIAN LOGIKA SCRIPT (TIDAK PERLU DIUBAH)
# ======================================================================

def kumpulkan_file(folder_project, ekstensi_diizinkan, folder_dilewati):
    """Mencari semua file yang cocok di dalam folder_project (termasuk sub-folder)."""
    daftar_file = []

    for root, dirs, files in os.walk(folder_project):
        # Buang folder yang ada di FOLDER_DILEWATI supaya tidak ikut dijelajahi
        dirs[:] = [d for d in dirs if d not in folder_dilewati]

        for nama_file in files:
            _, ekstensi = os.path.splitext(nama_file)
            if ekstensi.lower() in ekstensi_diizinkan:
                path_lengkap = os.path.join(root, nama_file)
                daftar_file.append(path_lengkap)

    daftar_file.sort()
    return daftar_file


def gabungkan(daftar_file, folder_project, file_output):
    """Menulis isi semua file dalam daftar_file ke satu file output."""
    with open(file_output, "w", encoding="utf-8") as f_out:
        for path_file in daftar_file:
            # Buat path relatif biar rapi, misal "src/main.js" bukan path panjang
            path_relatif = os.path.relpath(path_file, folder_project)
            # Ganti backslash jadi forward slash biar konsisten di Windows/Mac/Linux
            path_relatif = path_relatif.replace(os.sep, "/")

            f_out.write(f"{path_relatif}:\n")

            try:
                with open(path_file, "r", encoding="utf-8") as f_in:
                    isi = f_in.read()
                f_out.write(isi)
            except UnicodeDecodeError:
                f_out.write("[File ini tidak bisa dibaca sebagai teks, dilewati]\n")
            except Exception as e:
                f_out.write(f"[Gagal membaca file: {e}]\n")

            f_out.write("\n\n")


def main():
    print(f"Mencari file di dalam folder: {os.path.abspath(FOLDER_PROJECT)}")
    daftar_file = kumpulkan_file(FOLDER_PROJECT, EKSTENSI_DIIZINKAN, FOLDER_DILEWATI)

    if not daftar_file:
        print("Tidak ada file yang cocok ditemukan. Cek lagi EKSTENSI_DIIZINKAN.")
        return

    print(f"Ditemukan {len(daftar_file)} file. Sedang digabungkan...")
    gabungkan(daftar_file, FOLDER_PROJECT, FILE_OUTPUT)

    print(f"Selesai! Hasilnya ada di file: {FILE_OUTPUT}")


if __name__ == "__main__":
    main()
