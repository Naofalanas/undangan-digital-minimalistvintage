import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { id } = req.query;
    
    // Default fallback tags
    let title = "Undangan Pernikahan";
    let desc = "Anda diundang! Silakan klik tautan ini untuk melihat detail informasi acara pernikahan kami.";
    
    // If client ID is present, fetch dynamic data from Supabase REST API
    if (id) {
        const SUPABASE_URL = 'https://eaklrdnwodbyzagfitqb.supabase.co';
        // Public Anon Key for reading data
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVha2xyZG53b2RieXphZ2ZpdHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NTc3NDUsImV4cCI6MjA5MTUzMzc0NX0.Utl5GGT4A9DdTc30WzaJZnrggBCuHTthmCdeXpOcD6Q';
        
        try {
            // Fetch only the 'settings' column where client_id matches the ID
            const response = await fetch(`${SUPABASE_URL}/rest/v1/wedding_invitations?client_id=eq.${id}&select=settings`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0 && data[0].settings) {
                    const s = data[0].settings;
                    
                    // Extract first names
                    const groom = s.groomName ? s.groomName.split(' ')[0] : "Pria";
                    const bride = s.brideName ? s.brideName.split(' ')[0] : "Wanita";
                    
                    title = `Undangan Pernikahan — ${groom} & ${bride}`;
                    
                    if (s.akadDate) {
                        desc = `Undangan Pernikahan ${groom} & ${bride} — ${s.akadDate}. Kami mengundang Anda untuk merayakan hari bahagia kami.`;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to fetch from Supabase in serverless function:', e);
            // Will gracefully proceed with default title/desc
        }
    }
    
    try {
        // Read the local static index.html file
        const filePath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(filePath, 'utf8');
        
        // Inject Dynamic Meta Tags into the HTML String
        // 1. Replace Standard Tags
        html = html.replace('<title>Undangan Pernikahan</title>', `<title>${title}</title>`);
        html = html.replace(
            '<meta name="description" content="Anda diundang! Silakan klik tautan ini untuk melihat detail informasi acara pernikahan kami.">',
            `<meta name="description" content="${desc}">`
        );
        
        // 2. Add Open Graph (OG) Tags right before the closing </head>
        const ogTags = `
    <!-- Dynamic Open Graph Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
`;
        html = html.replace('</head>', `${ogTags}</head>`);
        
        // Send the modified HTML to the client/bot
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // Setting Cache-Control so WhatsApp doesn't cache the blank/wrong one forever if ID changes
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=86400');
        res.status(200).send(html);
        
    } catch (e) {
        console.error('Failed to read or process index.html:', e);
        // Fallback: Returns basic error or plain HTML if fs fails
        res.status(500).send('<h1>Internal Server Error - Unable to generate invitation</h1>');
    }
}
