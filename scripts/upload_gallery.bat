@echo off
set "URL=https://nsaroiebmxfqjampulbh.supabase.co"
set "KEY=sb_publishable_L-nsTtwEowIiuokw2Ye4gw_qxbmNxQa"

echo Uploading apt_bed...
curl -X POST "%URL%/storage/v1/object/assets/apartments/gallery_apt_bed.png" -H "Authorization: Bearer %KEY%" -H "apikey: %KEY%" -H "Content-Type: image/png" --data-binary "@C:\Users\juanc\.gemini\antigravity\brain\957e98d7-3a49-4d9b-953b-9a5d39811531\apt_bed_1772425227449.png"

echo Uploading apt_bath...
curl -X POST "%URL%/storage/v1/object/assets/apartments/gallery_apt_bath.png" -H "Authorization: Bearer %KEY%" -H "apikey: %KEY%" -H "Content-Type: image/png" --data-binary "@C:\Users\juanc\.gemini\antigravity\brain\957e98d7-3a49-4d9b-953b-9a5d39811531\apt_bath_1772425238678.png"

echo Uploading apt_balcony...
curl -X POST "%URL%/storage/v1/object/assets/apartments/gallery_apt_balcony.png" -H "Authorization: Bearer %KEY%" -H "apikey: %KEY%" -H "Content-Type: image/png" --data-binary "@C:\Users\juanc\.gemini\antigravity\brain\957e98d7-3a49-4d9b-953b-9a5d39811531\apt_balcony_1772425266773.png"

echo Uploading yacht_cabin...
curl -X POST "%URL%/storage/v1/object/assets/yachts/gallery_yacht_cabin.png" -H "Authorization: Bearer %KEY%" -H "apikey: %KEY%" -H "Content-Type: image/png" --data-binary "@C:\Users\juanc\.gemini\antigravity\brain\957e98d7-3a49-4d9b-953b-9a5d39811531\yacht_cabin_1772425279742.png"

echo Uploading yacht_deck...
curl -X POST "%URL%/storage/v1/object/assets/yachts/gallery_yacht_deck.png" -H "Authorization: Bearer %KEY%" -H "apikey: %KEY%" -H "Content-Type: image/png" --data-binary "@C:\Users\juanc\.gemini\antigravity\brain\957e98d7-3a49-4d9b-953b-9a5d39811531\yacht_deck_1772425296888.png"

echo Uploading yacht_bathroom...
curl -X POST "%URL%/storage/v1/object/assets/yachts/gallery_yacht_bathroom.png" -H "Authorization: Bearer %KEY%" -H "apikey: %KEY%" -H "Content-Type: image/png" --data-binary "@C:\Users\juanc\.gemini\antigravity\brain\957e98d7-3a49-4d9b-953b-9a5d39811531\yacht_bathroom_1772425310321.png"

echo Done.
