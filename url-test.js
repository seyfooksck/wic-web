const wicweb = require('wic-web');

// URL yapısını test etmek için
console.log('=== URL Yapısı Testleri ===');

// Test URL'leri
const testUrls = [
    'https://seyfooksck.dev/',
    'https://seyfooksck.dev/user',
    'https://seyfooksck.dev/admin/user',
    'https://seyfooksck.dev/admin/settings/profile',
    'https://seyfooksck.dev/blog/post.html',
    'https://seyfooksck.dev/admin/blog/edit.html'
];

testUrls.forEach(url => {
    console.log(`\n📝 Test URL: ${url}`);
});

console.log('\n=== Gerçek Test ===');

// Basit template test et
wicweb.downloadAllTemplates(['https://seyfooksck.dev'], {
    supportWordPressStructure: true,
    path: './test-theme'
}).catch(console.error);
