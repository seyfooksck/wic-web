# 🚀 GitHub ve NPM Otomatik Yayınlama Kurulum Rehberi

Bu rehber, Wic-Web projenizi GitHub'da yayınlayıp NPM'e otomatik olarak yayınlamanız için gerekli adımları açıklar.

## 📋 Ön Gereksinimler

- GitHub hesabı
- NPM hesabı
- Git kurulu
- Node.js kurulu

## 🛠️ Kurulum Adımları

### 1. GitHub Repository Oluşturun

```bash
# GitHub'da yeni repository oluşturun: https://github.com/new
# Repository adı: wic-web
# Public olarak ayarlayın
```

### 2. Local Projeyi GitHub'a Push Edin

```bash
# Git initialize edin
git init

# Tüm dosyaları ekleyin
git add .

# İlk commit
git commit -m "Initial commit: Wic-Web v1.0.0"

# GitHub remote ekleyin
git remote add origin https://github.com/seyfooksck/wic-web.git

# Main branch oluşturun ve push edin
git branch -M main
git push -u origin main
```

### 3. NPM Token Oluşturun

```bash
# NPM'e login olun
npm login

# Access token oluşturun
npm token create
```

Token'ı kopyalayın - bu token'ı GitHub Secrets'e ekleyeceksiniz.

### 4. GitHub Secrets Ekleyin

1. GitHub repository'nize gidin
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** butonuna tıklayın
4. **Name**: `NPM_TOKEN`
5. **Secret**: NPM token'ınızı yapıştırın
6. **Add secret** butonuna tıklayın

### 5. İlk Release Oluşturun

```bash
# Version tag oluşturun
git tag v1.0.0

# Tag'ı push edin
git push origin v1.0.0
```

Veya GitHub web interface'den:

1. Repository'nize gidin
2. **Releases** → **Create a new release**
3. **Tag version**: `v1.0.0`
4. **Release title**: `Wi-cWeb v1.0.0`
5. **Description**: Yeni özellikler ve değişiklikleri yazın
6. **Publish release** butonuna tıklayın

## 🎯 Otomatik Yayınlama Süreci

Release oluşturduğunuzda:

1. ✅ GitHub Actions tetiklenir
2. ✅ Dependencies yüklenir
3. ✅ Testler çalıştırılır
4. ✅ NPM'e otomatik yayınlanır

## 📝 Sonraki Güncellemeler

Yeni versiyon yayınlamak için:

```bash
# package.json'da version'ı güncelleyin
npm version patch   # 1.0.0 → 1.0.1
# veya
npm version minor   # 1.0.0 → 1.1.0
# veya
npm version major   # 1.0.0 → 2.0.0

# Tag'ı push edin
git push origin --tags

# GitHub'da yeni release oluşturun
```

## 🔄 GitHub Actions Workflow

`.github/workflows/npm-publish.yml` dosyası şu durumlarda tetiklenir:

- ✅ Yeni release oluşturulduğunda
- ✅ `v*` formatında tag push edildiğinde

## 🛡️ Güvenlik

- ❗ NPM token'ınızı asla public repository'lerde paylaşmayın
- ✅ GitHub Secrets kullanarak güvenli saklayın
- 🔄 Token'ınızı düzenli olarak yenileyin

## 📞 Sorun Giderme

### GitHub Actions Failed
- NPM_TOKEN secret'ınızı kontrol edin
- package.json'da version çakışması var mı kontrol edin
- Dependencies doğru yüklenmiş mi kontrol edin

### NPM Publish Failed
- NPM token'ının geçerli olduğunu kontrol edin
- Package adının benzersiz olduğunu kontrol edin
- Version numarasının daha önce kullanılmadığını kontrol edin

## 🎉 Başarılı Kurulum

Kurulum tamamlandıktan sonra:

- ✅ NPM: `npm install wic-web`
- ✅ GitHub: Repository stars & forks
- ✅ Automatic updates: Her release otomatik NPM'e gider

---

**seyfooksck.dev** - Wic-Web Advanced Website Theme Scraper
