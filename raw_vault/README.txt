Solerz Raw Data Vault
=====================
How to use:
1. Drop manufacturer files into corresponding category subfolders:
   - 01_solar_panels/[brand_name]/ (e.g. longi, trina, jinko) -> drop .pdf, .pan, .zip
   - 02_inverters/[brand_name]/ (e.g. deye, sungrow, growatt)  -> drop .pdf, .ond, .zip
   - 03_batteries/[brand_name]/ (e.g. pylontech, ecoflow)     -> drop .pdf
2. Run `python process_vault.py` to auto-process, compress, and ingest into database.
All files here are strictly ignored by .gitignore and will NEVER be uploaded to GitHub.
