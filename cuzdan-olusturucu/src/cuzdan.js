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
