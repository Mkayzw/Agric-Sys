const sharp = require('sharp');
const ico = require('sharp-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
    const svgBuffer = fs.readFileSync(path.join(__dirname, 'favicon.svg'));
    
    // Standard favicon sizes
    const standardSizes = [16, 32, 48, 64, 128, 256];
    
    // Platform-specific sizes
    const platformSizes = {
        // Windows Metro
        'mstile-70': 70,
        'mstile-144': 144,
        'mstile-150': 150,
        'mstile-310': 310,
        
        // Android
        'android-36': 36,
        'android-48': 48,
        'android-72': 72,
        'android-96': 96,
        'android-144': 144,
        'android-192': 192,
        'android-256': 256,
        'android-384': 384,
        'android-512': 512,
        
        // iOS
        'apple-touch-icon-57': 57,
        'apple-touch-icon-60': 60,
        'apple-touch-icon-72': 72,
        'apple-touch-icon-76': 76,
        'apple-touch-icon-114': 114,
        'apple-touch-icon-120': 120,
        'apple-touch-icon-144': 144,
        'apple-touch-icon-152': 152,
        'apple-touch-icon-180': 180,
        
        // macOS Safari
        'safari-pinned-tab': 256
    };
    
    // Generate standard PNGs
    console.log('Generating standard favicons...');
    const pngBuffers = await Promise.all(
        standardSizes.map(size => 
            sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );
    
    // Generate ICO file
    console.log('Generating favicon.ico...');
    const icoBuffer = await ico.encode(pngBuffers);
    fs.writeFileSync(path.join(__dirname, '../favicon.ico'), icoBuffer);
    
    // Generate platform-specific icons
    console.log('Generating platform-specific icons...');
    await Promise.all(
        Object.entries(platformSizes).map(async ([name, size]) => {
            const buffer = await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer();
            
            fs.writeFileSync(path.join(__dirname, `../${name}.png`), buffer);
        })
    );
    
    // Generate Safari pinned tab icon in SVG
    console.log('Generating Safari pinned tab icon...');
    fs.copyFileSync(
        path.join(__dirname, 'favicon.svg'),
        path.join(__dirname, '../safari-pinned-tab.svg')
    );
    
    // Generate manifest.json
    console.log('Generating manifest.json...');
    const manifest = {
        name: 'AgriConnect',
        short_name: 'AgriConnect',
        description: 'Connecting farmers with reliable service providers',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4CAF50',
        icons: [
            { sizes: '36x36', src: '/android-36.png' },
            { sizes: '48x48', src: '/android-48.png' },
            { sizes: '72x72', src: '/android-72.png' },
            { sizes: '96x96', src: '/android-96.png' },
            { sizes: '144x144', src: '/android-144.png' },
            { sizes: '192x192', src: '/android-192.png' },
            { sizes: '256x256', src: '/android-256.png' },
            { sizes: '384x384', src: '/android-384.png' },
            { sizes: '512x512', src: '/android-512.png' }
        ]
    };
    
    fs.writeFileSync(
        path.join(__dirname, '../manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
    
    // Generate browserconfig.xml
    console.log('Generating browserconfig.xml...');
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="/mstile-70.png"/>
            <square150x150logo src="/mstile-150.png"/>
            <square310x310logo src="/mstile-310.png"/>
            <TileColor>#4CAF50</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
    
    fs.writeFileSync(
        path.join(__dirname, '../browserconfig.xml'),
        browserconfig
    );
    
    console.log('Favicon generation complete!');
}

generateFavicons().catch(console.error); 