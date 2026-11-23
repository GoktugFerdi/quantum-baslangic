# quantum-baslangic

Quantum Team Blokzincir Takımı'nın yeni üye oryantasyon iş paketi için çalışma depom.

## Bu çalışmanın amacı

Bu depoda blokzincirin temel kavramlarını araştırıp kendi cümlelerimle yazıyorum, sonra öğrendiklerimi uygulamaya döküyorum. Hedefim:

- Blokzincirin hangi probleme çözüm olduğunu ve ne zaman gerekmediğini açıklayabilmek,
- Kendi yazdığım küçük bir uygulamayla eğitim cüzdanı oluşturup her aşamasını (entropi → 12 kelime → seed → anahtarlar → adres) görebilmek,
- Sepolia test ağında işlem yapıp sonucunu zincirde doğrulayabilmek,
- Küçük bir akıllı sözleşmeyi kendi web uygulamama bağlayabilmek.

## Öğrenmek istediğim konular

- Cüzdanların içeride nasıl çalıştığı (BIP39, BIP32, BIP44)
- Akıllı sözleşme yazmak, deploy etmek ve bir web arayüzünden çağırmak
- Bir işlemin imzadan kesinleşmeye kadar yolculuğu
- Sıfır bilgi ispatı (ZK) ve blokzincirde mahremiyet
- TEKNOFEST Blokzincir Yarışması'nda işe yarayacak pratik beceriler

## Klasör yapısı

```
quantum-baslangic/
├── README.md              → bu dosya
├── .gitignore             → depoya girmemesi gereken dosyalar
├── notlar/                → A bölümü araştırma notlarım
└── cuzdan-olusturucu/     → İP 12: eğitim cüzdanı oluşturucu (Vite + ethers v6)
    ├── index.html
    ├── package.json
    └── src/
        ├── cuzdan.js      → her dönüşüm ayrı bir fonksiyon (ekrandan bağımsız)
        ├── main.js        → aşamaları kart kart gösteren arayüz
        └── style.css
```

## Kullandığım araçlar

| Araç | Ne için | Sürüm |
|---|---|---|
| Visual Studio Code | Kod editörü | |
| Git | Sürüm kontrolü | |
| GitHub Desktop | Depoyu internette tutmak | 2.55.0.windows.5 |
| Node.js + npm | Cüzdan uygulamasını çalıştırmak | Node.js v24.14.1 |
| MetaMask | Tarayıcı cüzdanı (ayrı tarayıcı profilinde) | |
| Remix IDE | Solidity sözleşmelerini derlemek ve çağırmak | – |
| Vite | Cüzdan uygulamasının geliştirme sunucusu ve derleyicisi | 8.x |
| ethers | BIP39 / BIP32 / secp256k1 / Keccak işlemleri | 6.17 |

## Uygulamayı nasıl çalıştırırım

```bash
cd cuzdan-olusturucu
npm install      # yalnızca ilk seferde
npm run dev      # geliştirme sunucusunu başlatır
```

Terminalde çıkan adresi (genellikle `http://localhost:5173`) tarayıcıda açıp **“Yeni eğitim cüzdanı oluştur”** düğmesine basın. Uygulama tamamen tarayıcıda çalışır; hiçbir değer sunucuya, konsola, log'a veya tarayıcı depolamasına yazılmaz. Sayfa yenilenince her şey silinir.

## İP 12: Kendi Cüzdan Oluşturucum

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

### Benim yorumum: Mnemonic ile private key arasındaki fark

Uygulamamda 12 kelime 2. kartta, private key ise 6. kartta görünüyor ve aralarında üç dönüşüm var: seed, master anahtar ve türetme yolu. **Mnemonic** bütün anahtar ağacının köküdür. Aynı 12 kelimeden yolun son rakamını değiştirerek (`…/0/0`, `…/0/1`, `…/0/2` …) sınırsız sayıda hesap türetilebilir. **Private key** ise bu ağacın tek bir yaprağıdır ve yalnızca o tek hesabı kontrol eder. Bu yüzden private key'i sızan kişi bir hesabını, 12 kelimesi sızan kişi ise o kelimelerden türeyen bütün hesaplarını kaybeder. Ok yalnızca tek yönde ilerler: kelimelerden private key hesaplanabilir, ama private key'den kelimelere geri dönülemez. Ayrıca aynı kelimeler farklı bir passphrase ya da farklı bir yol ile bambaşka anahtarlar verir. Bu yüzden İP 13'te MetaMask ile karşılaştırırken yolun ve passphrase'in aynı olması gerekiyor.

## Güvenlik notu

Bu depodaki her şey **yalnızca eğitim amaçlı**. Kurtarma kelimeleri, seed, private key veya entropi bu depoya, ekran görüntülerine ya da mesajlara **asla** girmiyor. Yalnızca Sepolia test ağı kullanılıyor; eğitim cüzdanlarına gerçek varlık konmuyor.
