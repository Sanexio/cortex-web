# URL-Matrix after S2.3-diagnostik apply (2026-04-22)

## New URLs (expect 200)
  200  /diagnostik/
  200  /sonographie/
  200  /sonographie/schilddruese/
  200  /sonographie/beingefaesse/
  200  /belastungs-ekg/
  200  /lungenfunktion/
  200  /labor/

## 301 Redirects (old → new)
  301 → https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/sonographie/  (from /ultraschalldiagnostik/)
  301 → https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/sonographie/schilddruese/  (from /schilddruesen-sonographie/)
  301 → https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/sonographie/beingefaesse/  (from /ultraschall-der-beingefaesse/)
  301 → https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/labor/  (from /labordiagnostik/)

## Draft/deleted (expect 404 or redirect-to-draft)
  404  /rund-ums-labor/
  404  /sono-atlas-2/
  301  /sonographie/atlas/
  301  /sono-atlas/

## Regression Sensors (expect 200)
  200  /
  200  /karriere/
  200  /team/
  200  /leistungen/
  200  /check-ups/
  200  /praxis/
  200  /sprechstunden/
  200  /contact-us/
