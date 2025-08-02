const wicweb = require('wic-web');

// Örnek 1: Cookie ile kullanım (WordPress yapısı aktif)
const str = {
    supportWordPressStructure: true, // WordPress yapısı desteği
    requestTimeout: 30000, // İstek zaman aşımı süresi
    maxDepth: 6, // Maksimum derinlik
    path: './theme', // İndirilecek şablonların kaydedileceği dizin
};

const cookie = {
    name: 'token',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzdjZjcyOTg0ZTJkMTQwZGY3ZjE2NmQiLCJ1c2VySWQiOiIzMjQ4NjQzMDAwOTYiLCJpc0FkbWluIjp0cnVlLCJpc0Jhbm5lZCI6ZmFsc2UsImlzVmlwIjp0cnVlLCJ1c2VybmFtZSI6InNleWZvb2tzY2siLCJlbWFpbCI6InNleWZvb2tzY2tAZ21haWwuY29tIiwiYmFsYW5jZSI6MjkyLjIxLCJjbGFpbV9hbW91bnQiOjAuMiwiaWF0IjoxNzU0MTI2OTg4LCJleHAiOjE3NTQ3MzE3ODh9.ZFAmS8lCs_XktDPqUuset5hicdStnJA8LQeOd2q3hjA',
    domain: 'seyfooksck.dev', // Cookie'nin geçerli olduğu alan adı
};

async function example1() {
    console.log('=== Örnek 1: Cookie ile WordPress yapısı ===');
    // Test için çok seviyeli URL yapısı bulunan site
    await wicweb.downloadAllTemplates(['https://seyfooksck.dev/'], str, cookie);
}

async function example2() {
    console.log('\n=== Örnek 2: Cookie olmadan sadece tema indirme ===');
    await wicweb.downloadAllTemplates(['https://seyfooksck.dev/'], str);
}

async function example3() {
    console.log('\n=== Örnek 3: Minimal konfigürasyon ===');
    await wicweb.downloadAllTemplates(['https://seyfooksck.dev/'], {
        supportWordPressStructure: false,
        path: './simple-themes'
    });
}

// İstediğiniz örneği çalıştırın
example1().catch(console.error);