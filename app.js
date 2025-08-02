const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');

// İndirmek istediğiniz template URL'leri
const templateUrls = [
    'https://seyfooksck.dev/', // Ana sayfa
];

// Konfigürasyon
const config = {
    // WordPress benzeri yapıları destekle (uzantısız URL'ler)
    supportWordPressStructure: true,
    
    // İndirme derinliği (kaç seviye link takip edilecek)
    maxDepth: 2,
    
    // Timeout süreleri
    requestTimeout: 30000,
    
    // Hangi dosya türlerinin indirileceği
    fileExtensions: {
        images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'],
        styles: ['.css'],
        scripts: ['.js'],
        fonts: ['.woff', '.woff2', '.ttf', '.eot', '.otf']
    }
};

// Dosya indirme fonksiyonu
async function downloadFile(fileUrl, filePath, cookieHeader = null) {
    try {
        const options = {
            method: 'get',
            url: fileUrl,
            responseType: 'stream',
            timeout: config.requestTimeout
        };
        
        // Cookie varsa header'a ekle
        if (cookieHeader) {
            options.headers = {
                'Cookie': cookieHeader
            };
        }
        
        const response = await axios(options);
        
        await fs.ensureDir(path.dirname(filePath));
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.log(`⚠️  ${fileUrl} indirilemedi: ${error.message}`);
    }
}

// Dosya yolunu orijinal yapısını koruyarak düzenle
function getLocalFilePath(originalPath, outputDir) {
    // ./ ile başlayan yolları temizle
    let cleanPath = originalPath.replace(/^\.\//, '');
    
    // Dosya yolunu output directory ile birleştir
    return path.join(outputDir, cleanPath);
}

// Relatif yolu orijinal yapıda koru
function getRelativePathForHtml(originalPath) {
    // ./ ile başlayan yolları koru
    if (originalPath.startsWith('./')) {
        return originalPath;
    }
    // Başka bir şekilde relative ise ./ ekle
    if (!originalPath.startsWith('/') && !originalPath.startsWith('http')) {
        return './' + originalPath;
    }
    return originalPath;
}

// CSS dosyalarındaki URL'leri işleme
async function processCssUrls(cssContent, cssUrl, outputDir, cookieHeader = null, downloadedFiles = new Set()) {
    const baseUrl = cssUrl.substring(0, cssUrl.lastIndexOf('/'));
    const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
    let match;
    
    while ((match = urlRegex.exec(cssContent)) !== null) {
        const resourceUrl = match[1];
        if (!resourceUrl.startsWith('http') && !resourceUrl.startsWith('data:')) {
            const fullUrl = url.resolve(baseUrl + '/', resourceUrl);
            
            // Dosya daha önce indirildi mi kontrol et
            if (!downloadedFiles.has(fullUrl)) {
                downloadedFiles.add(fullUrl);
                const localPath = getLocalFilePath(resourceUrl, outputDir);
                
                await downloadFile(fullUrl, localPath, cookieHeader);
                console.log(`📄 CSS resource: ${resourceUrl}`);
            }
        }
    }
    
    return cssContent;
}

// HTML sayfalarındaki linkleri bulma
function findHtmlLinks($, baseUrl) {
    const htmlLinks = new Set();
    
    // Menü linklerini bul
    $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            // WordPress yapısını destekle
            if (config.supportWordPressStructure) {
                // .html ile biten veya uzantısız linkler
                if (href.endsWith('.html') || (!href.includes('.') && href !== '/' && href !== '')) {
                    const fullUrl = url.resolve(baseUrl + '/', href);
                    htmlLinks.add(fullUrl);
                }
            } else {
                // Sadece .html ile biten linkler
                if (href.endsWith('.html')) {
                    const fullUrl = url.resolve(baseUrl + '/', href);
                    htmlLinks.add(fullUrl);
                }
            }
        }
    });
    
    // Navigation linklerini bul
    $('nav a[href], .navbar a[href], .menu a[href], .navigation a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            if (config.supportWordPressStructure) {
                if (href.endsWith('.html') || (!href.includes('.') && href !== '/' && href !== '')) {
                    const fullUrl = url.resolve(baseUrl + '/', href);
                    htmlLinks.add(fullUrl);
                }
            } else {
                if (href.endsWith('.html')) {
                    const fullUrl = url.resolve(baseUrl + '/', href);
                    htmlLinks.add(fullUrl);
                }
            }
        }
    });
    
    return Array.from(htmlLinks);
}

// URL'nin dosya mı sayfa mı olduğunu kontrol et
function isPageUrl(urlString) {
    const parsedUrl = url.parse(urlString);
    const pathname = parsedUrl.pathname;
    
    // .html ile bitiyorsa kesinlikle sayfa
    if (pathname.endsWith('.html')) {
        return true;
    }
    
    // WordPress yapısı destekleniyorsa ve uzantı yoksa sayfa olarak kabul et
    if (config.supportWordPressStructure) {
        const hasExtension = path.extname(pathname) !== '';
        return !hasExtension && pathname !== '/' && pathname !== '';
    }
    
    return false;
}

// Sayfa dosya adını ve klasör yapısını belirleme
function getPageFileName(urlString) {
    const parsedUrl = url.parse(urlString);
    let pathname = parsedUrl.pathname;
    
    // Son / karakterini kaldır
    if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }
    
    // .html ile bitiyorsa
    if (pathname.endsWith('.html')) {
        // Klasör yapısını koru: admin/user/page.html -> admin/user/page.html
        const result = pathname.startsWith('/') ? pathname.substring(1) : pathname;
        return result;
    }
    
    // WordPress yapısı için
    if (config.supportWordPressStructure && pathname) {
        const segments = pathname.split('/').filter(s => s);
        
        if (segments.length === 0) {
            return 'index.html';
        }
        
        // Klasör yapısını koru: /admin/user -> admin/user.html
        if (segments.length > 1) {
            const folderPath = segments.slice(0, -1).join('/');
            const fileName = segments[segments.length - 1];
            const result = `${folderPath}/${fileName}.html`;
            return result;
        } else {
            // Tek segment: /user -> user.html
            const result = `${segments[0]}.html`;
            return result;
        }
    }
    
    return 'index.html';
}

// Cookie string'ini oluştur
function createCookieHeader(cookie) {
    if (!cookie) return null;
    
    if (typeof cookie === 'string') {
        return cookie;
    }
    
    if (typeof cookie === 'object' && cookie.name && cookie.value) {
        return `${cookie.name}=${cookie.value}`;
    }
    
    return null;
}

async function downloadTemplate(templateUrl, index, options = {}, cookie = null) {
    const templateName = `template-${index + 1}`;
    
    // Output directory'yi belirle (path artık zorunlu)
    const outputDir = path.resolve(options.path, templateName);
    
    console.log(`📦 ${templateName} indiriliyor...`);
    
    // Cookie header'ını hazırla
    const cookieHeader = createCookieHeader(cookie);
    if (cookieHeader) {
        console.log(`🍪 Cookie kullanılıyor: ${cookieHeader.substring(0, 50)}...`);
    }
    
    try {
        // Output klasörünü temizle ve oluştur
        await fs.remove(outputDir);
        await fs.ensureDir(outputDir);
        
        // İndirilen sayfaları ve dosyaları takip et
        const downloadedPages = new Set();
        const downloadedFiles = new Set(); // Dosya tekrarını önlemek için
        const pagesToDownload = [templateUrl];
        
        // Base URL'i al
        const baseUrl = templateUrl.substring(0, templateUrl.lastIndexOf('/'));
        
        while (pagesToDownload.length > 0) {
            const currentUrl = pagesToDownload.shift();
            
            if (downloadedPages.has(currentUrl)) {
                continue;
            }
            
            downloadedPages.add(currentUrl);
            console.log(`📄 Sayfa indiriliyor: ${path.basename(currentUrl)}`);
            
            // HTML dosyasını indir
            let response;
            try {
                const requestOptions = { 
                    timeout: config.requestTimeout 
                };
                
                // Cookie varsa header'a ekle
                if (cookieHeader) {
                    requestOptions.headers = {
                        'Cookie': cookieHeader
                    };
                }
                
                response = await axios.get(currentUrl, requestOptions);
            } catch (error) {
                console.log(`⚠️  ${currentUrl} indirilemedi: ${error.message}`);
                continue;
            }
            
            const html = response.data;
            const $ = cheerio.load(html);
            
            // Bu sayfadaki diğer HTML linklerini bul
            const htmlLinks = findHtmlLinks($, baseUrl);
            htmlLinks.forEach(link => {
                if (!downloadedPages.has(link) && !pagesToDownload.includes(link)) {
                    pagesToDownload.push(link);
                }
            });
            
            // CSS dosyalarını indir
            const cssPromises = [];
            $('link[rel="stylesheet"]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && !href.startsWith('http') && !href.startsWith('//')) {
                    const fullUrl = url.resolve(baseUrl + '/', href);
                    
                    // Dosya daha önce indirildi mi kontrol et
                    if (!downloadedFiles.has(fullUrl)) {
                        downloadedFiles.add(fullUrl);
                        const localPath = getLocalFilePath(href, outputDir);
                        
                        cssPromises.push(
                            downloadFile(fullUrl, localPath, cookieHeader).then(async () => {
                                console.log(`📄 CSS: ${href}`);
                                
                                // CSS içindeki kaynakları da indir
                                try {
                                    const cssRequestOptions = { timeout: config.requestTimeout };
                                    if (cookieHeader) {
                                        cssRequestOptions.headers = { 'Cookie': cookieHeader };
                                    }
                                    
                                    const cssResponse = await axios.get(fullUrl, cssRequestOptions);
                                    await processCssUrls(cssResponse.data, fullUrl, outputDir, cookieHeader, downloadedFiles);
                                } catch (error) {
                                    console.log(`⚠️  CSS içeriği işlenemedi: ${href}`);
                                }
                            })
                        );
                    }
                    
                    // HTML'deki href'i orijinal yapıda bırak
                    $(elem).attr('href', getRelativePathForHtml(href));
                }
            });
            
            // JavaScript dosyalarını indir
            const jsPromises = [];
            $('script[src]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && !src.startsWith('http') && !src.startsWith('//')) {
                    const fullUrl = url.resolve(baseUrl + '/', src);
                    
                    // Dosya daha önce indirildi mi kontrol et
                    if (!downloadedFiles.has(fullUrl)) {
                        downloadedFiles.add(fullUrl);
                        const localPath = getLocalFilePath(src, outputDir);
                        
                        jsPromises.push(
                            downloadFile(fullUrl, localPath, cookieHeader).then(() => {
                                console.log(`📄 JS: ${src}`);
                            })
                        );
                    }
                    
                    // HTML'deki src'yi orijinal yapıda bırak
                    $(elem).attr('src', getRelativePathForHtml(src));
                }
            });
            
            // Resimleri indir
            const imgPromises = [];
            $('img').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                    const fullUrl = url.resolve(baseUrl + '/', src);
                    
                    // Dosya daha önce indirildi mi kontrol et
                    if (!downloadedFiles.has(fullUrl)) {
                        downloadedFiles.add(fullUrl);
                        const localPath = getLocalFilePath(src, outputDir);
                        
                        imgPromises.push(
                            downloadFile(fullUrl, localPath, cookieHeader).then(() => {
                                console.log(`📄 IMG: ${src}`);
                            })
                        );
                    }
                    
                    // HTML'deki src'yi orijinal yapıda bırak
                    $(elem).attr('src', getRelativePathForHtml(src));
                }
            });
            
            // Background image'ları indir
            $('[style*="background-image"]').each((i, elem) => {
                const style = $(elem).attr('style');
                if (style) {
                    const bgMatch = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/);
                    if (bgMatch && bgMatch[1] && !bgMatch[1].startsWith('http') && !bgMatch[1].startsWith('data:')) {
                        const bgUrl = bgMatch[1];
                        const fullUrl = url.resolve(baseUrl + '/', bgUrl);
                        
                        // Dosya daha önce indirildi mi kontrol et
                        if (!downloadedFiles.has(fullUrl)) {
                            downloadedFiles.add(fullUrl);
                            const localPath = getLocalFilePath(bgUrl, outputDir);
                            
                            imgPromises.push(
                                downloadFile(fullUrl, localPath, cookieHeader).then(() => {
                                    console.log(`📄 BG: ${bgUrl}`);
                                })
                            );
                        }
                        
                        // Style'daki URL'yi orijinal yapıda bırak
                        const newStyle = style.replace(bgMatch[1], getRelativePathForHtml(bgUrl));
                        $(elem).attr('style', newStyle);
                    }
                }
            });
            
            // HTML linklerini yerel yollara dönüştür
            $('a[href]').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                    if (isPageUrl(url.resolve(baseUrl + '/', href))) {
                        const targetUrl = url.resolve(baseUrl + '/', href);
                        const fileName = getPageFileName(targetUrl);
                        // Klasör yapısını koruyarak relatif yol oluştur
                        $(elem).attr('href', fileName);
                    }
                }
            });
            
            // Tüm indirmeleri bekle
            await Promise.all([...cssPromises, ...jsPromises, ...imgPromises]);
            
            // Güncellenmiş HTML'i kaydet
            const updatedHtml = $.html();
            const pageFileName = getPageFileName(currentUrl);
            const fullPagePath = path.join(outputDir, pageFileName);
            
            // Klasör yapısını oluştur
            await fs.ensureDir(path.dirname(fullPagePath));
            await fs.writeFile(fullPagePath, updatedHtml);
        }
        
        console.log(`✅ ${templateName} başarıyla indirildi:`);
        console.log(`   📄 ${downloadedPages.size} sayfa indirildi`);
        console.log(`   📁 ${downloadedFiles.size} dosya indirildi`);
        console.log(`   📂 Konum: ${outputDir}`);
        
    } catch (error) {
        console.error(`❌ ${templateName} indirme hatası:`, error.message);
    }
}

async function downloadAllTemplates(urls = templateUrls, options = {}, cookie = null) {
    // Path zorunlu kontrol
    if (!options.path) {
        throw new Error('options.path zorunludur! Örnek: { path: "./theme" }');
    }
    
    // Konfigürasyonu güncelle
    const finalConfig = { ...config, ...options };
    Object.assign(config, finalConfig);
    
    console.log('🚀 Tema indirme işlemi başlatılıyor...\n');
    console.log(`📋 Konfigürasyon:`);
    console.log(`   WordPress yapısı: ${config.supportWordPressStructure ? 'Aktif' : 'Pasif'}`);
    console.log(`   Maksimum derinlik: ${config.maxDepth}`);
    console.log(`   Request timeout: ${config.requestTimeout}ms`);
    console.log(`   Output klasörü: ${options.path}`);
    if (cookie) {
        console.log(`   Cookie kullanımı: Aktif`);
    }
    console.log('');
    
    // Ana klasörü oluştur
    const mainDir = path.resolve(options.path);
    await fs.ensureDir(mainDir);
    
    // Her template'i sırayla indir
    for (let i = 0; i < urls.length; i++) {
        await downloadTemplate(urls[i], i, options, cookie);
        console.log(''); // Boş satır ekle
    }
    
    console.log('🎉 Tüm temalar başarıyla indirildi!');
    console.log(`📂 İndirilen temalar: ${path.resolve(options.path)}`);
}

// NPM modülü olarak export et
module.exports = {
    downloadAllTemplates,
    downloadTemplate,
    config
};

// Eğer dosya direkt çalıştırılıyorsa otomatik başlat
if (require.main === module) {
    downloadAllTemplates(templateUrls, { 
        path: './downloaded-themes',
        supportWordPressStructure: true 
    }).catch(console.error);
}