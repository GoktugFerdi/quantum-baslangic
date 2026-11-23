// Cüzdan oluşturma aşamaları — YALNIZCA EĞİTİM AMAÇLI.
// Bu dosya ekranla ilgilenmez; her fonksiyon tek bir dönüşümü yapar.
// Hiçbir değer console'a, sunucuya ya da tarayıcı depolamasına yazılmaz.

import {
  Mnemonic,
  HDNodeWallet,
  SigningKey,
  keccak256,
  dataSlice,
  getAddress,
  computeAddress,
  hexlify,
} from "ethers";

// ---------------------------------------------------------------------------
// Aşama 1: Entropi (128 bit = 16 bayt)
// ---------------------------------------------------------------------------
// crypto.getRandomValues, işletim sisteminin kriptografik olarak güvenli
// rastgele sayı üretecini (CSPRNG) kullanır. Math.random ise tahmin
// edilebilir bir sözde-rastgele üreteçtir ve anahtar üretiminde KULLANILMAZ.
export const ENTROPI_BAYT = 16; // 16 bayt × 8 = 128 bit → 12 kelime

export function entropiUret() {
  const entropi = new Uint8Array(ENTROPI_BAYT);
  crypto.getRandomValues(entropi);
  return entropi;
}

// ---------------------------------------------------------------------------
// Aşama 2: Entropi → 12 İngilizce kelime (BIP39)
// ---------------------------------------------------------------------------
// Mnemonic.fromEntropy şunları yapar:
//   1. Entropinin SHA-256 özetini alır; ilk (128 / 32) = 4 biti checksum'dır.
//   2. 128 bit entropi + 4 bit checksum = 132 bit elde edilir.
//   3. 132 bit, 11'er bitlik 12 parçaya bölünür (2^11 = 2048).
//   4. Her parça, BIP39 İngilizce listesindeki (2048 kelime) bir kelimenin
//      sıra numarasıdır.
// Passphrase bu deneyde boş kabul edilir; seed aşamasında kullanılacaktır.
export function kelimelereCevir(entropi) {
  const mnemonic = Mnemonic.fromEntropy(entropi);
  return {
    mnemonic, // sonraki aşamada (seed) kullanılacak nesne
    kelimeler: mnemonic.phrase.split(" "),
    checksumBitleri: checksumBitleri(mnemonic),
  };
}

// Ekranda göstermek için: son kelimenin son 4 biti checksum'dır.
function checksumBitleri(mnemonic) {
  const liste = mnemonic.wordlist;
  const bitler = mnemonic.phrase
    .split(" ")
    .map((k) => liste.getWordIndex(k).toString(2).padStart(11, "0"))
    .join("");
  return bitler.slice(-4);
}

// ---------------------------------------------------------------------------
// Aşama 3: 12 kelime → seed (BIP39)
// ---------------------------------------------------------------------------
// PBKDF2-HMAC-SHA512, 2048 tur.
//   parola = kelimelerin kendisi (NFKD normalize edilmiş)
//   salt   = "mnemonic" + passphrase  (bu deneyde passphrase = "")
// Sonuç 64 baytlık (512 bit) seed'dir. Bu adım tek yönlüdür:
// seed'den kelimelere geri dönülemez.
export const PASSPHRASE = ""; // İP 12 gereği boş

export function seedHesapla(mnemonic) {
  return mnemonic.computeSeed(); // 0x ile başlayan 128 hex karakter = 64 bayt
}

// ---------------------------------------------------------------------------
// Aşama 4: seed → master anahtar (BIP32 kökü)
// ---------------------------------------------------------------------------
// HMAC-SHA512(anahtar = "Bitcoin seed", veri = seed) hesaplanır.
//   ilk 32 bayt → master private key
//   son 32 bayt → master chain code (alt anahtar türetmede kullanılan ek bilgi)
export function masterAnahtar(seed) {
  return HDNodeWallet.fromSeed(seed); // derinlik 0, yol "m"
}

// ---------------------------------------------------------------------------
// Aşama 5: master → m/44'/60'/0'/0/0 (BIP32 türetme + BIP44 yol düzeni)
// ---------------------------------------------------------------------------
//   44'  amaç: BIP44 hiyerarşisi
//   60'  coin tipi: Ethereum (SLIP-44 listesi)
//   0'   hesap numarası
//   0    zincir: 0 = harici (alıcı) adresler, 1 = iç (para üstü) adresler
//   0    adres indeksi: ilk adres
// Kesme işareti (') "hardened" türetme demektir: alt anahtar, ebeveynin
// public key'inden değil private key'inden türetilir. Böylece bir alt
// private key sızsa bile üst seviyeler hesaplanamaz.
export const YOL = "m/44'/60'/0'/0/0";

export function yolTuret(master) {
  return master.derivePath(YOL);
}

// ---------------------------------------------------------------------------
// Aşama 6: private key → public key (secp256k1)
// ---------------------------------------------------------------------------
// public key = private key × G (secp256k1 eğrisinin üreteç noktası).
// Eliptik eğri çarpımı tek yönlüdür: public key'den private key bulunamaz.
// Sıkıştırılmamış biçim: 0x04 + X (32 bayt) + Y (32 bayt) = 65 bayt.
export function publicKeyHesapla(privateKey) {
  return SigningKey.computePublicKey(privateKey, false);
}

// ---------------------------------------------------------------------------
// Aşama 7: public key → Ethereum adresi
// ---------------------------------------------------------------------------
//   1. Baştaki 0x04 öneki atılır → 64 bayt (X + Y)
//   2. Keccak-256 özeti alınır → 32 bayt
//   3. Son 20 bayt adrestir
//   4. EIP-55: adresin kendi Keccak özetine göre bazı harfler büyük yazılır;
//      bu, elle yazımda yapılan hataları yakalayan bir checksum'dır.
export function adresHesapla(publicKey) {
  const xy = dataSlice(publicKey, 1); // 0x04 önekini at
  const ozet = keccak256(xy);
  const ham = dataSlice(ozet, 12); // 32 - 20 = 12 bayt atlanır
  const adres = getAddress(ham); // EIP-55 büyük/küçük harf

  // Elle yaptığımız hesabı kütüphanenin hazır fonksiyonuyla çapraz kontrol et.
  if (adres !== computeAddress(publicKey)) {
    throw new Error("Adres hesabı kütüphane sonucuyla uyuşmuyor");
  }
  return { adres, keccakOzeti: ozet, hamAdres: ham };
}

// ---------------------------------------------------------------------------
// Tüm zinciri tek seferde çalıştırır (ekran ve testler için).
// ---------------------------------------------------------------------------
export function cuzdanOlustur(entropi = entropiUret()) {
  const { mnemonic, kelimeler, checksumBitleri } = kelimelereCevir(entropi);
  const seed = seedHesapla(mnemonic);
  const master = masterAnahtar(seed);
  const hesap = yolTuret(master);
  const privateKey = hesap.privateKey;
  const publicKey = publicKeyHesapla(privateKey);
  const { adres, keccakOzeti, hamAdres } = adresHesapla(publicKey);
  return {
    entropi: hex(entropi),
    kelimeler,
    checksumBitleri,
    seed,
    masterPrivateKey: master.privateKey,
    masterChainCode: master.chainCode,
    yol: hesap.path,
    privateKey,
    publicKey,
    keccakOzeti,
    hamAdres,
    adres,
  };
}

export function hex(bayt) {
  return hexlify(bayt);
}

// ===========================================================================
// İP 13: Kelimelerden adres bulma ve checksum deneyi
// ===========================================================================

// Kullanıcının yazdığı metni kelime listesine çevirir.
// "1. kelime 2. kelime" gibi numaralı biçimi, büyük harfleri ve fazla
// boşlukları temizler.
export function ifadeyiTemizle(metin) {
  return metin
    .toLowerCase()
    .replace(/\d+\s*[.)]/g, " ")
    .split(/[\s,]+/)
    .filter(Boolean);
}

const LISTE = Mnemonic.fromEntropy(new Uint8Array(16)).wordlist; // BIP39 İngilizce

export function kelimeListesi() {
  const kelimeler = [];
  for (let i = 0; i < 2048; i++) kelimeler.push(LISTE.getWord(i));
  return kelimeler;
}

// Kelimelerin geçerli bir BIP39 mnemonic olup olmadığını kontrol eder ve
// geçersizse NEDENİNİ söyler. Bu kontrol yalnızca biçim kontrolüdür:
//   1. kelime sayısı 12 mi?
//   2. her kelime 2048 kelimelik listede var mı?
//   3. son 4 bit (checksum), ilk 128 bitin SHA-256 özetiyle tutuyor mu?
export function mnemonicDogrula(kelimeler) {
  if (kelimeler.length !== 12) {
    return { gecerli: false, neden: "sayi", mesaj: `12 kelime olmalı, ${kelimeler.length} kelime girildi.` };
  }
  const bilinmeyenler = kelimeler
    .map((k, i) => ({ sira: i + 1, k }))
    .filter(({ k }) => LISTE.getWordIndex(k) === -1);
  if (bilinmeyenler.length) {
    return {
      gecerli: false,
      neden: "kelime",
      mesaj: "BIP39 listesinde olmayan kelime var (sıra: " + bilinmeyenler.map((b) => b.sira).join(", ") + ").",
    };
  }
  if (!Mnemonic.isValidMnemonic(kelimeler.join(" "))) {
    return {
      gecerli: false,
      neden: "checksum",
      mesaj: "Kelimelerin hepsi listede ama checksum tutmuyor: son 4 bit, ilk 128 bitin SHA-256 özetiyle uyuşmuyor.",
    };
  }
  return { gecerli: true, neden: null, mesaj: "Geçerli: 12 kelime, hepsi listede ve checksum tutuyor." };
}

// Geçerli kelimelerden İP 12'deki aynı zinciri izleyerek adresi bulur:
// kelimeler → seed → master → m/44'/60'/0'/0/0 → private key → public key → adres
export function kelimelerdenAdres(kelimeler) {
  const mnemonic = Mnemonic.fromPhrase(kelimeler.join(" "));
  const hesap = yolTuret(masterAnahtar(seedHesapla(mnemonic)));
  return { adres: adresHesapla(publicKeyHesapla(hesap.privateKey)).adres, yol: hesap.path };
}

// Checksum deneyi: `sira` numaralı (1–12) kelimeyi `yeniKelime` ile değiştirip
// sonucun geçerli olup olmadığını döndürür.
export function tekKelimeDegistir(kelimeler, sira, yeniKelime) {
  const kopya = [...kelimeler];
  kopya[sira - 1] = yeniKelime;
  return mnemonicDogrula(kopya);
}

// Her sıradaki kelimeyi listedeki diğer 2047 kelimeyle tek tek değiştirip
// kaç tanesinin yine de "geçerli" sayıldığını sayar.
// Beklenti: checksum 4 bit olduğu için ~1/16. Son kelimenin 7 biti entropi,
// 4 biti checksum olduğu için orada tam 2^7 − 1 = 127 geçerli değişiklik olur.
export function checksumIstatistigi(kelimeler) {
  const satirlar = [];
  for (let sira = 1; sira <= 12; sira++) {
    const kopya = [...kelimeler];
    let gecerli = 0;
    for (let i = 0; i < 2048; i++) {
      const aday = LISTE.getWord(i);
      if (aday === kelimeler[sira - 1]) continue;
      kopya[sira - 1] = aday;
      if (Mnemonic.isValidMnemonic(kopya.join(" "))) gecerli++;
    }
    satirlar.push({ sira, denenen: 2047, gecerli });
  }
  return satirlar;
}
