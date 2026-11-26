# Sözleşmeler

## QuantumKayit.sol

Bu dosya, Quantum Team Blokzincir Takımı'nın ortak isim kayıt sözleşmesinin **kopyasıdır**. Kodu ben yazmadım; yalnızca oryantasyon paketindeki İP 18 görevi (kendi kopyamı deploy etme) için depoya eklendi. Sonraki etkinlik projesini kendim yazacağım.

- **Kaynak:** Takımın Sepolia'daki doğrulanmış sözleşmesi, Contract → Code bölümündeki `src/QuantumKayit.sol` dosyası
  - Adres: `0x81Dd700C459BF2806A1B5F2a349c89f0106A9036`
  - https://sepolia.etherscan.io/address/0x81Dd700C459BF2806A1B5F2a349c89f0106A9036#code
- **Lisans:** MIT (dosyadaki `SPDX-License-Identifier: MIT` satırı korundu)
- **Değişiklik:** Yok. Kod birebir aynı bırakıldı; tek karakter farkı bile derleme metadata'sını ve doğrulamayı etkileyebilir.

### Takım sözleşmesinin derleme ayarları

| Ayar | Değer |
|---|---|
| Derleyici | v0.8.24+commit.e11b9ed9 |
| Optimizasyon | Kapalı |
| EVM hedefi | cancun |

### Benim kopyalarım (Sepolia)

Derleyici 0.8.34 (Remix), optimizasyon ve EVM ayarı varsayılan.

**Kopya 2 (kullandığım kopya)**
- Sözleşme adresi: `0xA30F57a6443170839A94D2f1341d02cC7744D253`
- Deploy tx hash: `0xbb1d67fe7c060928a9d1baa3aa699be73748833e05a30cac2dc7294487fd8a26` (blok 12202796, nonce 5)
- https://sepolia.etherscan.io/address/0xA30F57a6443170839A94D2f1341d02cC7744D253

**Kopya 1 (kullanılmıyor)**
- Sözleşme adresi: `0x77724f2EF322260f745BeFd77206F8751e53070b`
- Deploy tx hash: `0xd7e174563233e5725f73fedc00de7fd676ea80b84f15720930b375d2b5ccfbe0` (blok 12202477, nonce 3)
- Bu kopyaya Remix'ten yanlışlıkla bir kayıt gönderildi (`0x5f9f3658872dafdf3717653e1a93e7f6253ba90a3d03d45669d1501cfa6d30b0`). İlk kaydın Etherscan'den yapılması istendiği için Kopya 2 açıldı.

---

## GfuEvent.sol (İP 20: İlk Etkinlik Kaydını Oluştur)

Bu sözleşmeyi kendim yazdım (agent desteğiyle, kodu satır satır inceleyerek). `QuantumKayit.sol` kopyasından bağımsızdır ve sonraki iş paketlerinde (İP 21, 22, ...) geliştirilecek etkinlik projemin ilk sürümüdür.

- **Etkinlik adı:** `GfuEvent`
- **Ortam:** Yalnızca Remix'in yerel ortamı (Remix VM). Henüz Sepolia'ya gönderilmedi.
- **Dosya:** [`GfuEvent.sol`](GfuEvent.sol)

### Ne yapıyor?

- `etkinlikAdi`: Tek bir etkinliğin adını (`"GfuEvent"`) tutan, dışarıdan okunabilen değişken.
- `takmaAd`: `mapping(address => string)`. Her adrese bir takma ad eşler. `public` olduğu için bir adres verilince o adresin kaydı dışarıdan okunabilir.
- `kayitOl(string)`: Çağıran kişinin kendi adresi adına takma ad kaydeder.

### Veri nerede tutuluyor?

Takma adlar `takmaAd` mapping'inde, yani sözleşmenin **state**'inde (zincir üzerindeki depolamada) tutuluyor. Mapping, soldaki sütunda adresler, sağdaki sütunda takma adlar olan bir tablo gibi düşünülebilir. Anahtar adrestir, bu yüzden her adresin kendi satırı vardır.

### `msg.sender` ne yapıyor?

`msg.sender`, fonksiyonu çağıran hesabın adresidir. Kod `takmaAd[msg.sender] = _takmaAd;` yazdığı için kayıt her zaman işlemi imzalayan hesabın satırına yazılır. `kayitOl` fonksiyonu adres parametresi almadığından kullanıcı başkasının adresi adına kayıt yapamaz. Bu şart, "kullanıcı yalnızca kendi adresi adına kayıt yapabilsin" kuralını sağlıyor.

### Yerelde yaptığım denemeler

1. Sözleşmeyi Remix'te derleyip **Remix VM** ortamında deploy ettim.
2. **Hesap 1** ile `kayitOl("ferdi")`, **Hesap 2** ile `kayitOl("goktug")` çağırdım.
3. `takmaAd` fonksiyonuna her iki hesabın adresini ayrı ayrı vererek iki kaydı okudum.

| Deneme | Beklenen | Gözlenen |
|---|---|---|
| Hesap 1 `kayitOl("ferdi")` | Kabul | Kabul |
| Hesap 2 `kayitOl("goktug")` | Kabul | Kabul |
| `takmaAd(Hesap 1 adresi)` | `ferdi` | `ferdi` |
| `takmaAd(Hesap 2 adresi)` | `goktug` | `goktug` |

İki kayıt birbirini etkilemedi; her adres kendi satırında tutuldu.

### Benim yorumum: Bu ilk sürüm hangi yanlış kullanımları henüz engellemiyor?

- **Boş takma ad:** `kayitOl("")` çağrılabilir, boş isim kaydedilir.
- **Tekrar kayıt:** Aynı adres tekrar `kayitOl` çağırarak eski takma adını ezebilir.
- **Kapasite sınırı yok:** Kayıt olabilecek kişi sayısı sınırsız.
- **Toplam kayıt sayısı okunamıyor:** Şu an kaç kişinin kayıt olduğunu veren bir alan yok.
- **Takma ad uzunluğu sınırsız:** Çok uzun metin girilebilir.
- **Adres başına kayıt, kişi başına kayıt değildir:** Aynı kişi birden çok adresle kayıt olabilir.

Bunların bir kısmı İP 21'de (boş ad, tekrar kayıt, kapasite) çözülecek.
