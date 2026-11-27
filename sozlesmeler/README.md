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
- **Dosya:** [`GfuEvent_v1_ip20.sol`](GfuEvent_v1_ip20.sol) (İP 21'de `GfuEvent.sol` geliştirildiği için ilk sürüm bu adla saklanıyor)

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

---

## GfuEvent.sol (İP 21: Kapasite ve Kayıt Kurallarını Ekle)

Aynı sözleşmeyi açık iş kurallarıyla geliştirdim. İP 20'deki ilk sürüm silinmedi: [`GfuEvent_v1_ip20.sol`](GfuEvent_v1_ip20.sol) olarak duruyor ve Git geçmişinde de var. Güncel sürüm [`GfuEvent.sol`](GfuEvent.sol). Yine yalnızca Remix VM'de çalıştırdım, Sepolia'ya gönderilmedi.

### Eklenen kurallar

- **Boş takma ad reddi:** `require(bytes(_takmaAd).length > 0, ...)`
- **Aynı adresin ikinci kaydı reddi:** `kayitliMi` mapping'i. Adres kayıtlıysa `require(!kayitliMi[msg.sender], ...)` işlemi geri alır.
- **Kapasite 3:** `KAPASITE` sabiti. `require(kayitSayisi < KAPASITE, ...)` dolu olduğunda yeni kaydı reddeder.
- **Toplam kayıt sayısı:** `kayitSayisi` `public` olduğu için dışarıdan okunuyor.

`require` kontrolleri durum değiştiren satırlardan önce çalışıyor ve koşul sağlanmazsa işlem `revert` oluyor. Revert, işlemin yaptığı bütün state değişikliklerini geri aldığı için reddedilen işlem `kayitSayisi`'ni artırmıyor.

### Denemeler (Remix VM)

| # | Deneme | Beklenen | Gözlenen |
|---|---|---|---|
| 1 | İlk geçerli kayıt (Hesap 1) | Kabul; toplam 1 | Kabul; toplam 1 |
| 2 | Aynı hesaptan tekrar kayıt | Ret; toplam 1 | Ret (`Bu adres zaten kayitli`); toplam 1 |
| 3 | Yeni hesaptan boş ad | Ret; toplam 1 | Ret; toplam 1 |
| 4 | İkinci ve üçüncü geçerli kayıt (Hesap 2, Hesap 3) | Kabul; toplam 3 | Kabul; toplam 3 |
| 5 | Dördüncü farklı hesabın kaydı (Hesap 4) | Ret; toplam 3 | Ret (revert); toplam 3 |

Ekran görüntüleri: `notlar/ekran-goruntuleri/ip21-tekrar-kayit-revert.png` (2. deneme) ve `notlar/ekran-goruntuleri/ip21-dorduncu-hesap-revert.png` (5. deneme).

### Benim yorumum: Adres başına sınır gerçek kişi sayısını neden garanti etmez?

Sözleşme kişiyi değil, yalnızca işlemi imzalayan adresi görüyor. Cüzdan adresi oluşturmak ücretsiz ve sınırsız olduğu için tek bir kişi birçok adres üretip her biriyle bir kez kayıt olabilir. Böylece 3 kişilik kapasite tek kişiyle dolabilir. Gerçek kişi başına sınır için sözleşme dışında kimlik doğrulaması gerekir.

---

## GfuEvent.sol (İP 22: Görevli ve Giriş Kontrolünü Ekle)

Aynı sözleşmeye görevli ve giriş kontrolü ekledim. Önceki sürümler duruyor: [`GfuEvent_v1_ip20.sol`](GfuEvent_v1_ip20.sol), [`GfuEvent_v2_ip21.sol`](GfuEvent_v2_ip21.sol). Güncel sürüm [`GfuEvent.sol`](GfuEvent.sol). Yalnızca yerel ortamda çalıştırıldı, Sepolia'ya gönderilmedi.

### Eklenen özellikler

- **Görevli:** `address public gorevli`. `constructor` içinde `gorevli = msg.sender` olduğu için sözleşmeyi deploy eden adres görevli olur.
- **Giriş durumu:** `mapping(address => bool) public girisYaptiMi`. Bir katılımcının giriş durumu dışarıdan okunur.
- **`girisYap(address katilimci)`:** Yalnızca görevli çağırabilir (`require(msg.sender == gorevli)`). Adres kayıtlı olmalı (`require(kayitliMi[katilimci])`) ve daha önce giriş yapmamış olmalı (`require(!girisYaptiMi[katilimci])`).
- **Event'ler:** `KayitYapildi(address indexed katilimci, string ad)` başarılı kayıtta, `GirisYapildi(address indexed katilimci)` başarılı girişte yayımlanır. İkisinde de katılımcı adresi var.

### Denemeler

Denemeleri [`test/ip22-test.js`](test/ip22-test.js) betiğiyle yerel bir EVM'de (ganache) çalıştırdım. Hesap 1 sözleşmeyi deploy eden ve görevli olan hesap.

| # | Deneme | Beklenen | Gözlenen |
|---|---|---|---|
| 1 | Görevli, kayıtlı Hesap 2'ye giriş verir | Başarı; giriş durumu değişir, event oluşur | Başarı; `girisYaptiMi(Hesap 2)` true, `GirisYapildi(Hesap 2 adresi)` event'i oluştu |
| 2 | Görevli olmayan hesap (Hesap 3) giriş verir | Ret; durum değişmez | Ret (`Sadece gorevli giris verebilir`); `girisYaptiMi(Hesap 3)` false |
| 3 | Görevli, kayıtsız adrese (Hesap 4) giriş verir | Ret | Ret (`Adres kayitli degil`); `girisYaptiMi(Hesap 4)` false |
| 4 | Aynı katılımcıya (Hesap 2) ikinci giriş | Ret; ilk giriş korunur | Ret (`Giris zaten yapildi`); `girisYaptiMi(Hesap 2)` hâlâ true |

Önceki kayıt ve kapasite denemelerini yeni sürümde de tekrarladım: ilk kayıt kabul (toplam 1), aynı hesaptan tekrar kayıt ret, boş ad ret, ikinci ve üçüncü kayıt kabul (toplam 3), dördüncü hesap `Kapasite dolu` ile ret (toplam 3). Reddedilen işlemler kayıt sayısını değiştirmedi ve kayıt başarılı olduğunda `KayitYapildi` event'i yayımlandı.

### Benim yorumum: Arayüzde düğmeyi gizlemek yerine yetkiyi sözleşmede denetlemek neden gerekir?

Arayüz yalnızca tarayıcıda çalışan, kullanıcının kontrolündeki bir koddur. Düğmeyi gizlemek kimseyi engellemez. Zincirdeki sözleşme herkese açık olduğu için herkes adresi ve ABI'yi kullanıp Etherscan, Remix veya kendi betiğiyle `girisYap`'ı doğrudan çağırabilir. Yetkiyi `require(msg.sender == gorevli)` ile sözleşmede denetlediğimizde, çağrı hangi arayüzden gelirse gelsin görevli olmayan adres reddedilir. Güvenliğin tek güvenilir yeri, kuralı değiştirilemez şekilde zincirde uygulayan sözleşmedir.


---

## GfuEvent.sol Sepolia'da (İP 23: Etkinlik Sözleşmemi Sepolia'ya Taşı)

İP 22'deki son [`GfuEvent.sol`](GfuEvent.sol) sürümünü hiç değiştirmeden Sepolia'ya yayınladım. Bu, takımın `QuantumKayit` kopyalarından ve yerel denemelerden ayrı, **kendi etkinlik sözleşmemin** Sepolia örneğidir.

### Deploy bilgileri

| Bilgi | Değer |
|---|---|
| Ağ | Ethereum Sepolia (chain ID 11155111) |
| Sözleşme adresi | `0x05781f2cbfb8010643f277728598977abAa26f58` |
| Deploy tx hash | `0xd7370e91f37be995e9f1c585cb416c65a4a120ab8f580dae85c460deacfcfba9` |
| Blok | 12221934 |
| Deploy eden / görevli | Eğitim hesabı 1: `0x344fDdb0F24005603797377189a0bfD277703e12` |
| Derleyici | Remix, 0.8.34+ (optimizasyon ve EVM hedefi Remix varsayılanı, değiştirilmedi) |
| ABI | [`sepolia/GfuEvent.abi.json`](sepolia/GfuEvent.abi.json) |
| Explorer | https://sepolia.etherscan.io/address/0x05781f2cbfb8010643f277728598977abAa26f58 |

Constructor parametresi yoktur; `gorevli` değeri `msg.sender` olduğu için görevli deploy eden Eğitim hesabı 1'dir. Depoya hiçbir gizli anahtar veya kurtarma kelimesi eklenmedi. Kendi etkinlik sözleşmemi Etherscan'de verify etmedim (İP 23'te ek çalışma).

### Yapılan işlemler

| # | İşlem | Hesap | Sonuç | Tx hash |
|---|---|---|---|---|
| 1 | Deploy | Eğitim hesabı 1 | Başarılı, blok 12221934 | `0xd7370e91f37be995e9f1c585cb416c65a4a120ab8f580dae85c460deacfcfba9` |
| 2 | `kayitOl("ikinci")` | Eğitim hesabı 2 (`0xf8F3ED6c7b197146a6640c840BBe95D1E71E8bF1`) | Başarılı, blok 12222039, `KayitYapildi` event'i | `0xcafbb30bb86be0e868b0ef9484aa03e842c00f0f3cbec35904c8540d69f0c6fa` |
| 3 | `girisYap(Eğitim hesabı 2)` | Eğitim hesabı 1 (görevli) | Başarılı, blok 12222044, `GirisYapildi` event'i | `0x8172d6ec3fc0f626dceb3d4f5281fe85cad10b9e4d01e5e822f23c44d46be5f1` |

Eğitim hesabı 1 de bu örneğe kayıtlıdır; zincirdeki toplam kayıt sayısı 2.

### Ek olarak zincirde görülen başarısız işlemler

Bu iki işlem Remix tarafından gönderildi ve zincirde `Fail` ile sonuçlandı. Durum değişmedi; yalnızca küçük bir ücret ödendi.

| İşlem | Neden başarısız | Tx hash |
|---|---|---|
| Görevli, henüz kayıtsız olan Eğitim hesabı 2'ye `girisYap` verdi (blok 12221957) | Adres kayıtlı değildi (`Adres kayitli degil`) | `0xc7cca5c223be60efd075d95f206d1677c637aa96d70d32844c3b4602e670d91c` |
| Eğitim hesabı 1 ikinci kez `kayitOl` çağırdı (blok 12222042) | `Bu adres zaten kayitli` | `0x6bb2b00dc87063c981e4e3d7c5fc901721c827bec43460faa1b220e29cba6716` |

### Okunan durum

- `kayitSayisi` = 2
- `kayitliMi(Eğitim hesabı 2)` = true, `takmaAd(Eğitim hesabı 2)` = `ikinci`
- Eğitim hesabı 2 için giriş işlemi başarılı oldu ve `GirisYapildi(Eğitim hesabı 2)` event'i yayımlandı.
- Yerel (Remix VM / ganache) denemelerdeki kayıtlar Sepolia örneğine taşınmadı; yeni örnekte yalnızca Sepolia'da yaptığım iki kayıt var.

Ekran görüntüleri `notlar/ekran-goruntuleri/` altında `ip23-*.png` adlarıyla durur.

### Benim yorumum: Yerel ve Sepolia sürümlerini karıştırmamak için hangi bilgileri kontrol ederim?

Önce ağı: MetaMask ve Remix'te ağın Sepolia (chain ID 11155111), ortamın Remix VM değil Injected Provider olduğuna bakarım. Sonra sözleşme adresini: yerel deploy'un adresi Sepolia'da yoktur, bu yüzden proje yapılandırmasındaki adresi, bu belgedeki adresle ve Etherscan'deki "Contract Created" işlemiyle karşılaştırırım. Deploy tx hash'i ve blok numarası da ayırıcıdır. Ek olarak `gorevli` ve `kayitSayisi` okunur; yerelde 3 kayıt dolu olsa bile yeni örnekte kayıtlar sıfırdan başlar. Aynı kod farklı adreste ayrı bir state tutar.
