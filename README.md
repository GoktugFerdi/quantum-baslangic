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
├── README.md        → bu dosya
├── .gitignore       → depoya girmemesi gereken dosyalar
└── notlar/          → A bölümü araştırma notlarım
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

## Uygulamayı nasıl çalıştırırım

İP 12'de cüzdan oluşturucu uygulamasını yazınca burayı dolduracağım.

## Güvenlik notu

Bu depodaki her şey **yalnızca eğitim amaçlı**. Kurtarma kelimeleri, seed, private key veya entropi bu depoya, ekran görüntülerine ya da mesajlara **asla** girmiyor. Yalnızca Sepolia test ağı kullanılıyor; eğitim cüzdanlarına gerçek varlık konmuyor.
