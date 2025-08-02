# Wic-Web - Advanced Website Theme Scraper

[![npm version](https://badge.fury.io/js/wic-web.svg)](https://badge.fury.io/js/wic-web)
[![GitHub license](https://img.shields.io/github/license/seyfooksck/wic-web.svg)](https://github.com/seyfooksck/wic-web/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/seyfooksck/wic-web.svg)](https://github.com/seyfooksck/wic-web/issues)
[![GitHub stars](https://img.shields.io/github/stars/seyfooksck/wic-web.svg)](https://github.com/seyfooksck/wic-web/stargazers)

🚀 Gelişmiş web scraper aracı ile web sitelerinin tam temasını indirin. WordPress ve diğer CMS yapılarını destekler.

## ✨ Özellikler

- ✅ **WordPress Desteği**: `/about`, `/contact` gibi uzantısız URL'leri destekler
- ✅ **Klasör Hiyerarşisi**: `/admin/user`, `/demo/template` gibi çok seviyeli URL yapılarını destekler
- ✅ **Orijinal Yapıyı Korur**: `./images/features/artwork-5.png` gibi dosya yollarını korur
- ✅ **Çoklu Sayfa İndirme**: Menülerdeki tüm sayfaları otomatik bulur ve indirir
- ✅ **Tam Kaynak İndirme**: CSS, JS, görseller, fontlar ve tüm bağımlılıklar
- ✅ **Cookie Desteği**: Giriş gerektiren sayfalar için cookie authentication
- ✅ **Dosya Deduplikasyonu**: Aynı dosyayı birden fazla kez indirmeyi önler
- ✅ **Konfigürasyonel**: İhtiyaca göre tamamen özelleştirilebilir
- ✅ **NPM Modülü**: Diğer projelerde kolayca kullanılabilir

## 📦 Kurulum

### NPM ile

```bash
npm install wic-web
```

### Yarn ile

```bash
yarn add wic-web
```

### Git ile

```bash
git clone https://github.com/seyfooksck/wic-web.git
cd wic-web
npm install
```

## 🚀 Hızlı Başlangıç

```javascript
const wicweb = require('wic-web');

// Basit kullanım
await wicweb.downloadAllTemplates(['https://seyfooksck.dev'], {
    path: './themes'
});
```

## 📖 Kullanım Örnekleri

### 1. Cookie ile Kimlik Doğrulama

```javascript
const wicweb = require('wic-web');

const cookie = {
    name: 'session_token',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    domain: 'seyfooksck.dev'
};

const options = {
    path: './authenticated-themes',
    supportWordPressStructure: true,
    maxDepth: 3,
    requestTimeout: 30000
};

await wicweb.downloadAllTemplates(['https://seyfooksck.dev/dashboard'], options, cookie);
```

### 2. Çoklu Site İndirme

```javascript
const wicweb = require('wic-web');

const urls = [
    'https://seyfooksck.dev/template.html',
    'https://seyfooksck.dev/demo.html',
    'https://seyfooksck.dev/showcase.html'
];

await wicweb.downloadAllTemplates(urls, {
    path: './multi-themes',
    supportWordPressStructure: true
});
```

### 3. WordPress Sitesi İndirme

```javascript
const wicweb = require('wic-web');

await wicweb.downloadAllTemplates(['https://seyfooksck.dev'], {
    path: './wp-theme',
    supportWordPressStructure: true, // /about, /contact gibi uzantısız URL'ler
    maxDepth: 4
});
```

### 4. Özel Konfigürasyon

```javascript
const wicweb = require('wic-web');

// Global konfigürasyonu değiştir
wicweb.config.supportWordPressStructure = true;
wicweb.config.maxDepth = 5;
wicweb.config.requestTimeout = 60000;

await wicweb.downloadAllTemplates(['https://seyfooksck.dev'], {
    path: './custom-themes'
});
```

## 📁 Çıktı Yapısı

```
themes/
├── template-1/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── demo/
│   │   ├── template-1.html
│   │   ├── settings.html
│   │   └── admin/
│   │       ├── user.html
│   │       └── dashboard.html
│   ├── css/
│   │   ├── style.css
│   │   ├── bootstrap.css
│   │   └── vendors.min.css
│   ├── js/
│   │   ├── main.js
│   │   ├── jquery.js
│   │   └── vendors.min.js
│   ├── images/
│   │   ├── features/
│   │   │   └── artwork-5.png
│   │   ├── icons/
│   │   └── logo.png
│   └── fonts/
│       ├── font-awesome.woff2
│       └── roboto.ttf
└── template-2/
    └── ...
```

## 🔧 Komut Satırı Kullanımı

```bash
# Geliştirme sırasında test et
npm start

# Örnek kullanımları test et
npm test

# Özel test dosyası çalıştır
node test.js
```

## 📚 API Referansı

### `downloadAllTemplates(urls, options, cookie)`

Ana fonksiyon - Birden fazla URL'den tema indirir.

**Parametreler:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `urls` | `Array<string>` | ✅ | İndirilecek URL listesi |
| `options` | `Object` | ✅ | Konfigürasyon ayarları |
| `cookie` | `Object\|string` | ❌ | Cookie bilgisi (kimlik doğrulama için) |

**Options Parametreleri:**

| Seçenek | Tip | Varsayılan | Açıklama |
|---------|-----|------------|----------|
| `path` | `string` | - | **ZORUNLU** - İndirilen dosyaların kaydedileceği klasör |
| `supportWordPressStructure` | `boolean` | `true` | WordPress yapısını destekle (uzantısız URL'ler) |
| `maxDepth` | `number` | `2` | Link takip derinliği |
| `requestTimeout` | `number` | `30000` | Request timeout süresi (ms) |

**Cookie Parametreleri:**

| Özellik | Tip | Zorunlu | Açıklama |
|---------|-----|---------|----------|
| `name` | `string` | ✅ | Cookie adı |
| `value` | `string` | ✅ | Cookie değeri |
| `domain` | `string` | ❌ | Cookie domain'i |

**Örnek:**

```javascript
await wicweb.downloadAllTemplates(
    ['https://seyfooksck.dev/template.html'],
    {
        path: './my-themes',
        supportWordPressStructure: true,
        maxDepth: 3,
        requestTimeout: 45000
    },
    {
        name: 'auth_token',
        value: 'abc123xyz',
        domain: 'seyfooksck.dev'
    }
);
```

### `downloadTemplate(url, index, options, cookie)`

Tek bir template indirir.

**Parametreler:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `url` | `string` | ✅ | İndirilecek URL |
| `index` | `number` | ✅ | Template indeksi |
| `options` | `Object` | ✅ | Konfigürasyon ayarları |
| `cookie` | `Object\|string` | ❌ | Cookie bilgisi |

### `config`

Global konfigürasyon objesi.

```javascript
const wicweb = require('wic-web');

// Konfigürasyonu görüntüle
console.log(wicweb.config);

// Konfigürasyonu değiştir
wicweb.config.supportWordPressStructure = false;
wicweb.config.maxDepth = 5;
wicweb.config.requestTimeout = 60000;
```

## 🎯 Gelişmiş Özellikler

### Klasör Hiyerarşisi Desteği

Wic-Web, URL yapısındaki klasör hiyerarşisini otomatik olarak tanır ve korur:

- `seyfooksck.dev/user` → `user.html`
- `seyfooksck.dev/admin/user` → `admin/user.html`
- `seyfooksck.dev/admin/settings/profile` → `admin/settings/profile.html`

### Dosya Deduplikasyonu

Aynı dosyanın birden fazla kez indirilmesini önler:
- CSS dosyalarında referans edilen kaynaklar
- JavaScript dosyaları
- Görseller ve fontlar
- Tekrarlanan sayfa linkleri

### WordPress URL Yapısı

WordPress ve benzeri CMS'lerin uzantısız URL yapısını destekler:
- `/about` → `about.html`
- `/contact` → `contact.html`
- `/blog/post-title` → `blog/post-title.html`



## 🛠️ Geliştirme

```bash
# Repository'yi clone edin
git clone https://github.com/seyfooksck/wic-web.git
cd wic-web

# Bağımlılıkları yükleyin
npm install

# Test edin
npm test

# Geliştirme modunda çalıştırın
npm start
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**seyfooksck.dev**
- GitHub: [@seyfooksck](https://github.com/seyfooksck)
- Website: [seyfooksck.dev](https://seyfooksck.dev)

## 🐛 Hata Bildirimi

Herhangi bir hata bulursanız, lütfen [GitHub Issues](https://github.com/seyfooksck/wic-web/issues) sayfasından bildirin.

## ⭐ Destek

Bu proje yararlıysa, lütfen ⭐ vererek destekleyin!

