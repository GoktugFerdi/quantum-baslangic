# cuzdan-olusturucu

İP 12-13 için yazdığım **eğitim amaçlı cüzdan oluşturucu**. Tarayıcıda çalışır, hiçbir veriyi sunucuya göndermez.

## Çalıştırma

```bash
npm install      # yalnızca ilk seferde
npm run dev      # geliştirme sunucusunu başlatır
```

Terminalde çıkan adresi (genellikle `http://localhost:5173`) tarayıcıda açın ve **"Yeni eğitim cüzdanı oluştur"** düğmesine basın. Sayfa yenilenince her şey silinir. Bu uygulamayla üretilen cüzdanlara gerçek varlık koymayın.

## Dosyalar

| Dosya | Ne işe yarar? |
|---|---|
| `src/cuzdan.js` | Her dönüşüm (entropi → kelime → seed → anahtar → adres) ayrı bir fonksiyon. Ekrandan bağımsız. |
| `src/dogrulama.js` | İP 13: kelimelerden adres bulma ve checksum deneyi. |
| `src/main.js`, `src/style.css` | Aşamaları kart kart gösteren arayüz. |

## Aşamalar

Uygulama, rastgelelikten Ethereum adresine giden her aşamayı ayrı bir kartta gösterir. Hassas alanlar (entropi, kelimeler, seed, master anahtar, private key) varsayılan olarak bulanıktır ve “Göster” ile açılır. Her dönüşüm `src/cuzdan.js` içinde ayrı bir fonksiyondur.

| # | Aşama | Kullanılan çağrı | Ne yapıyor? |
|---|---|---|---|
| 1 | **Entropi** (128 bit) | `crypto.getRandomValues(new Uint8Array(16))` | Tarayıcının kriptografik olarak güvenli rastgele sayı üreteciyle 16 bayt üretilir. `Math.random` tahmin edilebilir olduğu için kullanılmaz. |
| 2 | **12 kelime** (BIP39) | `Mnemonic.fromEntropy(entropi)` | Entropinin SHA-256 özetinin ilk 4 biti checksum olarak eklenir (128 + 4 = 132 bit). 132 bit 11'er bitlik 12 parçaya bölünür; her parça 2048 kelimelik listede bir kelimenin sıra numarasıdır. |
| 3 | **Seed** (512 bit) | `mnemonic.computeSeed()` | PBKDF2-HMAC-SHA512, 2048 tur. Salt = `"mnemonic" + passphrase`. Passphrase bu deneyde **boş**. Tek yönlüdür. |
| 4 | **Master anahtar** (BIP32 kökü) | `HDNodeWallet.fromSeed(seed)` | `HMAC-SHA512("Bitcoin seed", seed)` → ilk 32 bayt master private key, son 32 bayt chain code. |
| 5 | **Türetme yolu** (BIP32/BIP44) | `master.derivePath("m/44'/60'/0'/0/0")` | 44' = BIP44, 60' = Ethereum, 0' = ilk hesap, 0 = harici zincir, 0 = ilk adres. `'` hardened türetmedir. MetaMask'in ilk hesabı da bu yolu kullanır. |
| 6 | **Private key** | `hesap.privateKey` | Bu yoldaki hesabın 32 baytlık gizli anahtarı; işlemleri imzalar. |
| 7 | **Public key** (secp256k1) | `SigningKey.computePublicKey(privateKey, false)` | `private key × G`. Sıkıştırılmamış biçim: `0x04 + X + Y` = 65 bayt. Geri döndürülemez. |
| 8 | **Ethereum adresi** | `keccak256(dataSlice(pub, 1))` → `dataSlice(özet, 12)` → `getAddress(...)` | `0x04` atılır, Keccak-256 özetinin son 20 baytı adres olur. `getAddress` EIP-55 büyük/küçük harf checksum'ını uygular. Sonuç `computeAddress` ile çapraz kontrol edilir. |

### Doğrulama

Geliştirme sırasında şu kontroller yapıldı ve hepsi geçti:

- 4 resmî BIP39 test vektörünün entropi → kelime dönüşümü birebir aynı çıktı.
- Seed, Node.js'in bağımsız `crypto.pbkdf2Sync` uygulamasıyla aynı sonucu verdi.
- Herkesçe bilinen test ifadesi `abandon ×11 about` (boş passphrase, `m/44'/60'/0'/0/0`) beklenen adresi verdi: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94`.
- 20 rastgele cüzdanın adresi ve private key'i, ethers'ın tek adımlık `Wallet.fromPhrase` sonucuyla aynı çıktı.
