# quantum-baslangic

Quantum Team **Blokzincir Takımı** yeni üye oryantasyon paketi için hazırladığım çalışma deposu.
İçinde araştırma notlarım, kendi yazdığım küçük bir cüzdan uygulaması ve Ethereum test ağında (Sepolia) çalışan akıllı sözleşmelerim var.

> **Güvenlik:** Depoda gerçek para, private key, kurtarma kelimesi veya `.env` dosyası yoktur. Yalnızca test ağı (Sepolia) ve yerel test ortamı kullanıldı.

## Kısaca bu proje ne?

1. **Öğrendim:** Blokzincirin temel kavramlarını (blok, node, cüzdan, akıllı sözleşme, işlem...) araştırıp kendi cümlelerimle yazdım.
2. **Yazdım:** Kendi eğitim cüzdanı oluşturucumu ve küçük bir **etkinlik kayıt sözleşmesi** (`GfuEvent`) geliştirdim: katılımcılar takma adla kayıt olur, kapasite 3 kişidir, yalnızca görevli giriş onaylayabilir.
3. **Kanıtladım:** Sözleşmeyi Sepolia'ya yayınladım, işlemleri Etherscan'de doğruladım ve her adımı belgeledim.

## Neyin nerede olduğu

| Klasör / dosya | İçinde ne var? | Kime lazım? |
|---|---|---|
| **`notlar/QuantumTeam Notlar.docx`** | Word'de yazdığım **araştırma ve görev notları**. Her iş paketi (İP 01-23) için sorulara verdiğim cevaplar ve "Benim yorumum" bölümleri burada. Başvuru dosyası gibi düşünün: ne yaptım, ne öğrendim, sonuç ne oldu. | Notları okumak isteyen herkes |
| **`notlar/ekran-goruntuleri/`** | Notlardaki iddiaların kanıtı olan ekran görüntüleri (Etherscan, Remix, MetaMask). Dosya adları `ip17-...`, `ip23-...` gibi hangi iş paketine ait olduğunu söyler. | Kanıtı görmek isteyenler |
| **`sozlesmeler/`** | Akıllı sözleşme kodları (`.sol`), yerel test betiği ve Sepolia'daki adresler/işlem bilgileri. Ayrıntılı anlatım kendi `README.md` dosyasında. | Kod ve zincir kanıtı için |
| **`cuzdan-olusturucu/`** | Tarayıcıda çalışan eğitim cüzdanı uygulaması (12 kelimeden adrese her aşamayı gösterir). Kendi `README.md` dosyasında. | Uygulamayı denemek isteyenler |

## Hangi teknolojileri kullandık?

| Teknoloji | Ne işe yarıyor? |
|---|---|
| **Solidity** | Akıllı sözleşme yazma dili. Etkinlik sözleşmem bununla yazıldı. |
| **Ethereum Sepolia** | Gerçek para içermeyen, deneme amaçlı Ethereum ağı. |
| **Remix IDE** | Sözleşmeyi tarayıcıda derleyip yayınlamak ve fonksiyonlarını denemek için araç. |
| **MetaMask** | İşlemleri imzalayan tarayıcı cüzdanı (eğitim hesaplarıyla kullanıldı). |
| **Etherscan (Sepolia)** | Zincirdeki işlemleri, event'leri ve sözleşme kodunu herkese gösteren web sitesi (explorer). |
| **ethers.js** | JavaScript'ten Ethereum işlemleri yapmak için kütüphane (cüzdan uygulamasında). |
| **Vite + Node.js** | Cüzdan uygulamasını çalıştıran geliştirme araçları. |
| **ganache** | Bilgisayarda çalışan sahte Ethereum ağı; sözleşme testleri için. |
| **Git + GitHub** | Sürüm takibi ve bu depo. |

## Nasıl incelenir? (en hızlıdan en derine)

**1. Hiçbir kurulum olmadan**
- `notlar/QuantumTeam Notlar.docx` dosyasını indirip Word ile okuyun.
- Aşağıdaki Etherscan bağlantılarından zincirdeki işlemlere bakın.

**2. Tarayıcıda, kurulumsuz deneme**
- [Remix IDE](https://remix.ethereum.org) açın, `sozlesmeler/GfuEvent.sol` içeriğini yeni bir dosyaya yapıştırıp derleyin.
- Ortam olarak **Remix VM** seçip Deploy edin. Cüzdan ve ETH gerekmez. `kayitOl`, `girisYap` gibi fonksiyonları deneyin.

**3. Bilgisayarda (Node.js gerekir)**
- Sözleşme testleri (kabul/ret denemelerinin hepsini bir komutla görürsünüz):
  ```bash
  cd sozlesmeler/test
  npm init -y
  npm i solc@0.8.28 ganache@7 ethers@6
  node ip22-test.js ../GfuEvent.sol
  ```
- Cüzdan uygulaması:
  ```bash
  cd cuzdan-olusturucu
  npm install
  npm run dev
  ```
  Çıkan adresi (genellikle `http://localhost:5173`) tarayıcıda açın.

### Sepolia'daki sözleşmeler (herkese açık)

| Sözleşme | Etherscan |
|---|---|
| **GfuEvent**, kendi etkinlik sözleşmem (İP 23) | [0x0578...6f58](https://sepolia.etherscan.io/address/0x05781f2cbfb8010643f277728598977abAa26f58) |
| QuantumKayit kopyam (İP 18-19) | [0xA30F...D253](https://sepolia.etherscan.io/address/0xA30F57a6443170839A94D2f1341d02cC7744D253) |
| Takımın ortak QuantumKayit sözleşmesi | [0x81Dd...9036](https://sepolia.etherscan.io/address/0x81Dd700C459BF2806A1B5F2a349c89f0106A9036) |

Etherscan'de bir işleme tıklayınca **Status** (başarılı mı), **Input Data** (ne gönderildi) ve **Logs** (hangi event yayımlandı) bölümlerine bakın. Bazı işlemler bilerek **Fail** görünür: yetkisiz giriş veya ikinci kayıt gibi reddedilmesi gereken denemelerdir.

## Yol haritası

```
A Temeller          B Hazırlık ve Cüzdan       C Takım Sözleşmesi        D Kendi Projem             E Web Arayüzü
İP 01-10            İP 11-15                   İP 16-19                  İP 20-23                   İP 24-25
Araştırma           Ortam, cüzdan, test ETH    Kayıt, kopya deploy,      Kapasite, görevli,         Cüzdan bağlantılı
                                               Etherscan ile kayıt       Sepolia'ya taşıma          arayüz, hata durumları
   Tamam               Tamam                      Tamam                     Tamam                      Sırada
```

| Aşama | İş paketleri | Ne yapıldı? | Durum |
|---|---|---|---|
| A | İP 01-10 | Blokzincir, node, cüzdan, akıllı sözleşme, RPC, ekosistem ve yarışma şartnamesi araştırması | Tamam |
| B | İP 11-15 | Çalışma ortamı kurulumu, kendi cüzdan oluşturucum, MetaMask ile karşılaştırma, test ETH ve USDC | Tamam |
| C | İP 16-19 | Takım sözleşmesine kayıt, Etherscan'de doğrulama, sözleşmenin kendi kopyam | Tamam |
| D | İP 20-23 | Kendi etkinlik sözleşmem: kayıt, kapasite, görevli ve giriş; yerel testler; Sepolia'ya yayın | Tamam |
| E | İP 24-25 | Cüzdana bağlı web arayüzü; işlem bekleme ve hata durumlarını gösterme | Henüz yapılmadı |

## Kullandığım araçlar ve sürümler

| Araç | Sürüm |
|---|---|
| Node.js | v24.14.1 |
| Vite | 8.x |
| ethers | 6.17 |
| GitHub Desktop | 2.55 |
| Remix derleyici | 0.8.34+ |

## Klasör yapısı

```
quantum-baslangic/
├── README.md                → bu dosya
├── notlar/                  → Word notları + kanıt ekran görüntüleri
├── sozlesmeler/             → Solidity kodları, testler, Sepolia bilgileri
│   ├── GfuEvent.sol         → güncel etkinlik sözleşmem
│   ├── GfuEvent_v1_ip20.sol, GfuEvent_v2_ip21.sol → önceki sürümler
│   ├── QuantumKayit.sol     → takım sözleşmesinin kopyası
│   ├── sepolia/             → Sepolia için ABI dosyası
│   └── test/                → yerel test betiği
└── cuzdan-olusturucu/       → eğitim cüzdanı uygulaması (Vite + ethers)
```
