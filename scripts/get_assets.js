import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    const { data: allData, error } = await supabase.from('assets').select('id, name, type, description, images')

    if (error) {
        console.error("Error", error)
        return
    }

    // Save to file
    fs.writeFileSync('./scripts/assets_output.json', JSON.stringify(allData, null, 2), 'utf-8')
    console.log('Saved to scripts/assets_output.json')
}

run()
