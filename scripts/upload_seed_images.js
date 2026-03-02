import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const imageMap = {
    "Oceanfront Penthouse Suite": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\apt_penthouse_1772413342733.png",
    "Sea View Apartment": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\apt_seaview_1772413353985.png",
    "Garden Paradise Villa": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\apt_garden_1772413367188.png",
    "Tropical Studio": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\apt_studio_1772413381455.png",
    "Yacht Azzurro 50ft": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\yacht_azzurro_1772413394166.png",
    "Yacht Caribbean Star": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\yacht_star_1772413408498.png",
    "Yacht Ruby": "C:\\Users\\juanc\\.gemini\\antigravity\\brain\\59257687-e066-44ff-9297-8660f95728c6\\yacht_ruby_1772413430497.png"
}

async function run() {
    const assetsJson = JSON.parse(fs.readFileSync('./scripts/assets_output.json', 'utf8'))

    for (const asset of assetsJson) {
        if (imageMap[asset.name]) {
            const localPath = imageMap[asset.name]
            if (!fs.existsSync(localPath)) {
                console.error(`File not found: ${localPath}`)
                continue
            }

            const fileBuffer = fs.readFileSync(localPath)
            const fileName = `${asset.type}s/${asset.id}_${Date.now()}.png`

            console.log(`Uploading ${asset.name} ...`)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('assets')
                .upload(fileName, fileBuffer, { contentType: 'image/png' })

            if (uploadError) {
                console.error(`Upload error for ${asset.name}:`, uploadError.message)
                continue
            }

            const { data: publicUrlData } = supabase.storage
                .from('assets')
                .getPublicUrl(uploadData.path)

            const publicUrl = publicUrlData.publicUrl
            console.log(`Updating ${asset.name} with URL: ${publicUrl}`)

            const { error: updateError } = await supabase
                .from('assets')
                .update({ images: [publicUrl] })
                .eq('id', asset.id)

            if (updateError) {
                console.error(`Update error for ${asset.name}:`, updateError.message)
            } else {
                console.log(`Successfully updated ${asset.name}`)
            }
        }
    }
}

run()
