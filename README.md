# quantum-baslangic

Quantum Team Blokzincir Takımı'nın yeni üye oryantasyon iş paketi için çalışma depom. Araştırma notlarım, eğitim cüzdanı uygulamam ve Sepolia test ağındaki akıllı sözleşmelerim burada.

> **Güvenlik notu:** Depoda gerçek varlık, private key, kurtarma kelimesi veya `.env` dosyası yoktur. Yalnızca Sepolia test ağı ve yerel test ortamı kullanıldı. Cüzdan uygulamasının ürettiği hesaplar yalnızca eğitim amaçlıdır.

## Takım üyeleri ve kaptanlar için: bu depo nasıl incelenir?

Aşağıdaki yollardan istediğinizi, ihtiyacınız kadar derinlikte izleyebilirsiniz. En hızlı yol 1. ve 2. adımdır (kurulum gerekmez).

| # | Ne incelenir? | Nasıl? | Kurulum |
|---|---|---|---|
| 1 | **Araştırma ve görev notları** (İP 01-23 cevapları, "Benim yorumum" bölümleri) | [`notlar/QuantumTeam Notlar.docx`](notlar/) dosyasını indirip Word ile açın. Kanıt görüntüleri [`notlar/ekran-goruntuleri/`](notlar/ekran-goruntuleri/) klasöründe, `ipXX-...png` adlarıyla. | Yok |
| 2 | **Zincirdeki kanıtlar** (deploy, kayıt, giriş işlemleri) | Aşağıdaki Etherscan bağlantılarını açın. İşlem hash'leri ve adresler [`sozlesmeler/README.md`](sozlesmeler/README.md) içinde. | Yok |
| 3 | **Akıllı sözleşme kodu** | [`sozlesmeler/GfuEvent.sol`](sozlesmeler/GfuEvent.sol) (güncel), önceki sürümler `GfuEvent_v1_ip20.sol` ve `GfuEvent_v2_ip21.sol`. Takımın ortak sözleşmesinin kopyası: `QuantumKayit.sol`. | Yok |
| 4 | **Sözleşmeyi kendiniz çalıştırın** | [Remix IDE](https://remix.ethereum.org)'de `GfuEvent.sol` dosyasını açın, derleyin ve **Remix VM** ortamında deploy edip fonksiyonları deneyin. Cüzdan veya ETH gerekmez. | Tarayıcı |
| 5 | **Otomatik testler** | Aşağıdaki "Sözleşme testlerini çalıştırma" bölümü. Reddedilen/kabul edilen tüm denemeleri bir komutla görürsünüz. | Node.js |
| 6 | **Cüzdan oluşturucu uygulaması** (İP 12-13) | Aşağıdaki "Uygulamayı nasıl çalıştırırım" bölümü. | Node.js |

### Sepolia'daki sözleşmeler (herkese açık, salt okunur inceleme)

| Sözleşme | Adres | Etherscan |
|---|---|---|
| **GfuEvent** (kendi etkinlik sözleşmem, İP 23) | `0x05781f2cbfb8010643f277728598977abAa26f58` | [Aç](https://sepolia.etherscan.io/address/0x05781f2cbfb8010643f277728598977abAa26f58) |
| QuantumKayit kopyam (İP 18-19) | `0xA30F57a6443170839A94D2f1341d02cC7744D253` | [Aç](https://sepolia.etherscan.io/address/0xA30F57a6443170839A94D2f1341d02cC7744D253) |
| Takımın ortak QuantumKayit sözleşmesi | `0x81Dd700C459BF2806A1B5F2a349c89f0106A9036` | [Aç](https://sepolia.etherscan.io/address/0x81Dd700C459BF2806A1B5F2a349c89f0106A9036) |

Etherscan'de bir işleme tıklayıp **Status**, **Input Data** (Decode) ve **Logs** (`KayitYapildi`, `GirisYapildi`) alanlarını kontrol edebilirsiniz. Başarısız işlemler de bilerek bırakıldı: "yetkisiz çağrı" ve "ikinci kayıt" gibi reddedilen denemelerin zincirde `Fail` olarak görünmesi beklenen sonuçtur.

### Sözleşme testlerini çalıştırma (İP 21-22 denemeleri)

Sepolia'ya hiçbir şey gönderilmez; test betiği yerel bir EVM'de (ganache) çalışır.

```bash
cd sozlesmeler/test
npm init -y
npm i solc@0.8.28 ganache@7 ethers@6
node ip22-test.js ../GfuEvent.sol
```

Çıktıda her deneme için `KABUL` veya `RET` ile revert nedeni görünür. Node.js 20+ önerilir.

## İş paketi ilerlemesi

| İş paketi | Durum | Nerede? |
|---|---|---|
| İP 01-10 Araştırma (kavramlar, proje ve şartname incelemesi) | Tamam | `notlar/QuantumTeam Notlar.docx` |
| İP 11 Çalışma ortamı | Tamam | Bu README, "Kullandığım araçlar" |
| İP 12 Kendi cüzdan oluşturucum | Tamam | `cuzdan-olusturucu/` |
| İP 13 MetaMask karşılaştırması ve checksum deneyi | Tamam | `cuzdan-olusturucu/src/dogrulama.js`, notlar |
| İP 14-15 Test ETH, test USDC ve iki transferin karşılaştırması | Tamam | Notlar ve ekran görüntüleri |
| İP 16-19 Takım sözleşmesine kayıt, kopya deploy, Etherscan ile kayıt | Tamam | `sozlesmeler/README.md`, notlar |
| İP 20-22 Kendi etkinlik sözleşmem (kapasite, görevli, giriş) | Tamam | `sozlesmeler/GfuEvent.sol` |
| İP 23 Sözleşmeyi Sepolia'ya taşıma | Tamam | `sozlesmeler/README.md` (İP 23 bölümü) |
| İP 24-25 Web arayüzü, bekleme ve hata durumları | Henüz yapılmadı | - |

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
├── notlar/                → araştırma ve görev notları (Word) + kanıt ekran görüntüleri
├── cuzdan-olusturucu/     → İP 12-13: eğitim cüzdanı oluşturucu (Vite + ethers v6)
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── cuzdan.js      → her dönüşüm ayrı bir fonksiyon (ekrandan bağımsız)
│       ├── dogrulama.js   → İP 13: kelimelerden adres bulma, checksum deneyi
│       ├── main.js        → aşamaları kart kart gösteren arayüz
│       └── style.css
└── sozlesmeler/           → Solidity sözleşmeleri, testler, Sepolia bilgileri
    ├── GfuEvent.sol       → güncel etkinlik sözleşmem (İP 22)
    ├── GfuEvent_v1_ip20.sol, GfuEvent_v2_ip21.sol → önceki sürümler
    ├── QuantumKayit.sol   → takım sözleşmesinin kopyası (İP 18)
    ├── sepolia/           → İP 23: Sepolia ABI dosyası
    ├── test/ip22-test.js  → yerel denemeler (ganache)
    └── README.md          → sözleşmelerin ayrıntılı anlatımı ve zincir bilgileri
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


