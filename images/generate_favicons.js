<<<<<<< HEAD
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
    for (const size of standardSizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, `favicon-${size}.png`));
    }
    
    // Generate platform-specific icons
    console.log('Generating platform-specific icons...');
    for (const [name, size] of Object.entries(platformSizes)) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, `${name}.png`));
    }
    
    // Generate favicon.ico with multiple sizes
    console.log('Generating favicon.ico...');
    const pngBuffers = await Promise.all(
        [16, 32, 48].map(size => 
            sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );
    const icoBuffer = await ico.encode(pngBuffers);
    fs.writeFileSync(path.join(__dirname, 'favicon.ico'), icoBuffer);
    
    // Generate special formats
    console.log('Generating special formats...');
    
    // Safari pinned tab (monochrome)
    await sharp(svgBuffer)
        .resize(256, 256)
        .greyscale()
        .toFile(path.join(__dirname, 'safari-pinned-tab.svg'));
    
    // Copy 32x32 as main favicon.png
    fs.copyFileSync(
        path.join(__dirname, 'favicon-32.png'),
        path.join(__dirname, 'favicon.png')
    );
    
    // Generate browserconfig.xml for Windows
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="images/mstile-70.png"/>
            <square150x150logo src="images/mstile-150.png"/>
            <square310x310logo src="images/mstile-310.png"/>
            <TileColor>#4CAF50</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
    fs.writeFileSync(path.join(__dirname, 'browserconfig.xml'), browserconfig);
    
    // Generate site.webmanifest for PWA
    const webmanifest = {
        name: "AgriConnect",
        short_name: "AgriConnect",
        icons: [
            {
                src: "images/android-192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "images/android-512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ],
        theme_color: "#4CAF50",
        background_color: "#ffffff",
        display: "standalone"
    };
    fs.writeFileSync(
        path.join(__dirname, 'site.webmanifest'),
        JSON.stringify(webmanifest, null, 2)
    );
    
    console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error); 
=======
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
    for (const size of standardSizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, `favicon-${size}.png`));
    }
    
    // Generate platform-specific icons
    console.log('Generating platform-specific icons...');
    for (const [name, size] of Object.entries(platformSizes)) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, `${name}.png`));
    }
    
    // Generate favicon.ico with multiple sizes
    console.log('Generating favicon.ico...');
    const pngBuffers = await Promise.all(
        [16, 32, 48].map(size => 
            sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );
    const icoBuffer = await ico.encode(pngBuffers);
    fs.writeFileSync(path.join(__dirname, 'favicon.ico'), icoBuffer);
    
    // Generate special formats
    console.log('Generating special formats...');
    
    // Safari pinned tab (monochrome)
    await sharp(svgBuffer)
        .resize(256, 256)
        .greyscale()
        .toFile(path.join(__dirname, 'safari-pinned-tab.svg'));
    
    // Copy 32x32 as main favicon.png
    fs.copyFileSync(
        path.join(__dirname, 'favicon-32.png'),
        path.join(__dirname, 'favicon.png')
    );
    
    // Generate browserconfig.xml for Windows
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="images/mstile-70.png"/>
            <square150x150logo src="images/mstile-150.png"/>
            <square310x310logo src="images/mstile-310.png"/>
            <TileColor>#4CAF50</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
    fs.writeFileSync(path.join(__dirname, 'browserconfig.xml'), browserconfig);
    
    // Generate site.webmanifest for PWA
    const webmanifest = {
        name: "AgriConnect",
        short_name: "AgriConnect",
        icons: [
            {
                src: "images/android-192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "images/android-512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ],
        theme_color: "#4CAF50",
        background_color: "#ffffff",
        display: "standalone"
    };
    fs.writeFileSync(
        path.join(__dirname, 'site.webmanifest'),
        JSON.stringify(webmanifest, null, 2)
    );
    
    console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error); 
>>>>>>> 1d12cc19c4d3855a6b3534a8acfc9a5c99a896ea
generateFavicons().catch(console.error); 