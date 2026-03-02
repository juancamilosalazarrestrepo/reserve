const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local manually to avoid needing dotenv
const envPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
    const envVars = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of envVars) {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            process.env[match[1].trim()] = match[2].trim()
        }
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const APT_IMAGES = [
    'C:\\Users\\juanc\\.gemini\\antigravity\\brain\\957e98d7-3a49-4d9b-953b-9a5d39811531\\apt_bed_1772425227449.png',
    'C:\\Users\\juanc\\.gemini\\antigravity\\brain\\957e98d7-3a49-4d9b-953b-9a5d39811531\\apt_bath_1772425238678.png',
    'C:\\Users\\juanc\\.gemini\\antigravity\\brain\\957e98d7-3a49-4d9b-953b-9a5d39811531\\apt_balcony_1772425266773.png'
]

const YACHT_IMAGES = [
    'C:\\Users\\juanc\\.gemini\\antigravity\\brain\\957e98d7-3a49-4d9b-953b-9a5d39811531\\yacht_cabin_1772425279742.png',
    'C:\\Users\\juanc\\.gemini\\antigravity\\brain\\957e98d7-3a49-4d9b-953b-9a5d39811531\\yacht_bathroom_1772425310321.png',
    'C:\\Users\\juanc\\.gemini\\antigravity\\brain\\957e98d7-3a49-4d9b-953b-9a5d39811531\\yacht_deck_1772425296888.png'
]

async function uploadImage(localPath, folderName) {
    if (!fs.existsSync(localPath)) {
        console.error(`File not found: ${localPath}`)
        return null
    }

    const fileBuffer = fs.readFileSync(localPath)
    const baseName = path.basename(localPath)
    const fileName = `${folderName}/gallery_${baseName}`

    console.log(`Uploading ${fileName} ...`)
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, fileBuffer, { contentType: 'image/png', upsert: true })

    if (uploadError) {
        console.error(`Upload error for ${fileName}:`, uploadError.message)
        return null
    }

    const { data: publicUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(uploadData.path)

    return publicUrlData.publicUrl
}

async function run() {
    console.log('Uploading shared apartment images...')
    for (const img of APT_IMAGES) await uploadImage(img, 'apartments')

    console.log('Uploading shared yacht images...')
    for (const img of YACHT_IMAGES) await uploadImage(img, 'yachts')

    console.log('Done uploading! The URLs should now be in the bucket.')
}

run()
