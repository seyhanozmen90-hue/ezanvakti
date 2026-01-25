# 🤝 Katkıda Bulunma Rehberi

Ezan Vakitleri projesine katkıda bulunmak istediğiniz için teşekkürler!

## Nasıl Katkıda Bulunurum?

### 1. Issue Açın

Öncelikle bir issue açarak önerinizi veya bulduğunuz hatayı paylaşın:

- 🐛 **Bug Report**: Hata bildirimi için
- ✨ **Feature Request**: Yeni özellik önerisi için
- 📝 **Documentation**: Dokümantasyon iyileştirmeleri için
- 💬 **Question**: Sorularınız için

### 2. Fork ve Clone

```bash
# Repo'yu fork edin (GitHub'da Fork butonuna tıklayın)

# Clone edin
git clone https://github.com/KULLANICI_ADINIZ/ezanvakti.git
cd ezanvakti

# Upstream ekleyin
git remote add upstream https://github.com/ORJINAL_REPO/ezanvakti.git
```

### 3. Branch Oluşturun

```bash
# Feature branch oluşturun
git checkout -b feature/amazing-feature

# veya bug fix için
git checkout -b fix/bug-description
```

### 4. Geliştirme Yapın

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### 5. Kod Standartları

- **TypeScript** kullanın
- **ESLint** kurallarına uyun
- **Prettier** ile formatlamayı kontrol edin
- Anlamlı commit mesajları yazın

#### Commit Mesaj Formatı

```
feat: Yeni özellik ekle
fix: Hata düzelt
docs: Dokümantasyon güncelle
style: Kod formatı düzenle
refactor: Kod iyileştirmesi
test: Test ekle/güncelle
chore: Genel bakım işleri
```

Örnek:
```bash
git commit -m "feat: İlçe seçiciye arama özelliği ekle"
git commit -m "fix: Dark mode'da geri sayım rengi düzelt"
```

### 6. Test Edin

```bash
# Build kontrolü
npm run build

# Lint kontrolü
npm run lint
```

### 7. Push ve Pull Request

```bash
# Değişiklikleri push edin
git push origin feature/amazing-feature
```

GitHub'da Pull Request açın:

1. Açıklayıcı bir başlık yazın
2. Ne değiştirdiğinizi detaylıca açıklayın
3. Varsa screenshot ekleyin
4. İlgili issue'yu bağlayın (#123)

## Geliştirme Kuralları

### TypeScript

- `any` kullanmaktan kaçının
- Tüm fonksiyonlara tip tanımı ekleyin
- Interface'leri `lib/types.ts` içinde tanımlayın

### React/Next.js

- Functional component kullanın
- Client component'ler için `'use client'` ekleyin
- Server component'leri default kullanın
- Custom hook'lar `use` ile başlamalı

### Styling

- Tailwind CSS kullanın
- Custom CSS'den kaçının
- Responsive tasarım için mobile-first yaklaşım

### Performans

- Gereksiz re-render'lardan kaçının
- Büyük listeler için lazy loading kullanın
- Image'lar için `next/image` kullanın

## Özellik İstekleri

Yeni özellik eklemeden önce:

1. Issue açın ve tartışmaya açın
2. Topluluktan feedback alın
3. Onay aldıktan sonra geliştirmeye başlayın

## Code Review

Tüm PR'lar review sürecinden geçer:

- Kod kalitesi kontrolü
- Test kontrolü
- Dokümantasyon kontrolü
- Performans değerlendirmesi

## İletişim

- 💬 GitHub Discussions: Genel tartışmalar
- 🐛 GitHub Issues: Bug report ve feature request
- 📧 Email: Özel konular için

## Lisans

Katkılarınız MIT lisansı altında lisanslanacaktır.

---

Katkılarınız için teşekkür ederiz! 🙏
