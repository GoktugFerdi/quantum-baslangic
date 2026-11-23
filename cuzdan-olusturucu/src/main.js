import "./style.css";
import { cuzdanOlustur, ENTROPI_BAYT, YOL, PASSPHRASE } from "./cuzdan.js";
import { dogrulamaPaneli } from "./dogrulama.js";

// Tüm değerler yalnızca bu sayfanın belleğinde tutulur.
// console.log, fetch, localStorage KULLANILMAZ; sayfa yenilenince her şey silinir.

const app = document.querySelector("#app");

app.innerHTML = `
  <header>
    <h1>Eğitim Cüzdanı Oluşturucu</h1>
    <p class="uyari">
      Yalnızca eğitim amaçlıdır. Burada üretilen kelimeleri gerçek varlık için
      kullanmayın, gizli alanları ekran görüntüsüne almayın ve kimseyle paylaşmayın.
    </p>
    <div class="dugmeler">
      <button id="olustur">Yeni eğitim cüzdanı oluştur</button>
      <button id="hepsiniGizle" class="ikincil" hidden>Tüm gizli alanları kapat</button>
      <button id="temizle" class="ikincil" hidden>Ekranı temizle</button>
    </div>
  </header>
  <main id="asamalar"></main>
  <section id="dogrulama" class="panel"></section>
`;

dogrulamaPaneli(document.querySelector("#dogrulama"));

const asamalar = document.querySelector("#asamalar");
const hepsiniGizleBtn = document.querySelector("#hepsiniGizle");
const temizleBtn = document.querySelector("#temizle");

// Bir aşamayı kart olarak çizer. Hassas değerler varsayılan olarak gizlidir.
// degerler: [{ etiket, deger }] — bir kartta birden fazla değer olabilir.
function kart({ no, baslik, degerler, cagri, aciklama, hassas = true }) {
  const el = document.createElement("section");
  el.className = "kart";
  el.innerHTML = `
    <h2>
      <span class="no">${no}</span>
      <span class="baslik"></span>
      <span class="etiket ${hassas ? "gizli-etiket" : "acik-etiket"}">
        ${hassas ? "Gizli tutulmalı" : "Paylaşılabilir"}
      </span>
    </h2>
    <div class="degerler"></div>
    <p class="cagri">Kullanılan çağrı: <code></code></p>
    <p class="aciklama"></p>
  `;
  // Değerler textContent ile yazılır (HTML olarak yorumlanmaz).
  el.querySelector(".baslik").textContent = baslik;
  el.querySelector(".cagri code").textContent = cagri;
  el.querySelector(".aciklama").textContent = aciklama;

  const kutu = el.querySelector(".degerler");
  for (const { etiket, deger } of degerler) {
    const satir = document.createElement("div");
    satir.className = "deger-satiri";
    if (etiket) {
      const e = document.createElement("span");
      e.className = "deger-etiketi";
      e.textContent = etiket;
      satir.append(e);
    }
    const kod = document.createElement("code");
    kod.className = "deger" + (hassas ? " gizli" : "");
    kod.textContent = deger;
    satir.append(kod);

    if (hassas) {
      const btn = document.createElement("button");
      btn.className = "goster";
      btn.textContent = "Göster";
      btn.addEventListener("click", () => {
        const gizli = kod.classList.toggle("gizli");
        btn.textContent = gizli ? "Göster" : "Gizle";
      });
      satir.append(btn);
    }
    kutu.append(satir);
  }
  return el;
}

function ekraniTemizle() {
  asamalar.replaceChildren();
  hepsiniGizleBtn.hidden = true;
  temizleBtn.hidden = true;
}

function hepsiniGizle() {
  for (const kod of asamalar.querySelectorAll(".kart .deger")) {
    const btn = kod.parentElement.querySelector(".goster");
    if (btn) {
      kod.classList.add("gizli");
      btn.textContent = "Göster";
    }
  }
}

document.querySelector("#olustur").addEventListener("click", () => {
  ekraniTemizle();
  const c = cuzdanOlustur();

  asamalar.append(
    kart({
      no: 1,
      baslik: `Entropi (${ENTROPI_BAYT * 8} bit)`,
      degerler: [{ deger: c.entropi }],
      cagri: `crypto.getRandomValues(new Uint8Array(${ENTROPI_BAYT}))`,
      aciklama:
        "Tarayıcının kriptografik olarak güvenli rastgele sayı üreteci (CSPRNG) ile " +
        "16 bayt üretildi. Math.random tahmin edilebilir olduğu için kullanılmadı. " +
        "Cüzdanın tüm güvenliği bu sayının tahmin edilemez olmasına dayanır.",
    }),

    kart({
      no: 2,
      baslik: "12 İngilizce kelime (BIP39 mnemonic)",
      degerler: [{ deger: c.kelimeler.map((k, i) => `${i + 1}. ${k}`).join("   ") }],
      cagri: "Mnemonic.fromEntropy(entropi).phrase",
      aciklama:
        "Entropinin SHA-256 özetinin ilk 4 biti checksum olarak sona eklendi " +
        `(bu cüzdanda: ${c.checksumBitleri}). 128 + 4 = 132 bit, 11'er bitlik 12 parçaya ` +
        "bölündü; her parça 2048 kelimelik BIP39 listesinden bir kelimenin sıra numarası oldu. " +
        "Bu yüzden son kelime kısmen checksum taşır.",
    }),

    kart({
      no: 3,
      baslik: "Seed (512 bit)",
      degerler: [{ deger: c.seed }],
      cagri: "mnemonic.computeSeed()",
      aciklama:
        "Kelimeler PBKDF2-HMAC-SHA512 ile 2048 tur işlendi. Salt olarak " +
        `"mnemonic" + passphrase kullanıldı; bu deneyde passphrase boş ("${PASSPHRASE}"). ` +
        "Sonuç 64 baytlık seed'dir. Bu işlem tek yönlüdür: seed'den kelimelere geri dönülemez. " +
        "Farklı bir passphrase tamamen farklı bir seed ve dolayısıyla farklı hesaplar üretir.",
    }),

    kart({
      no: 4,
      baslik: "Master anahtar (BIP32 kökü, yol: m)",
      degerler: [
        { etiket: "Master private key", deger: c.masterPrivateKey },
        { etiket: "Master chain code", deger: c.masterChainCode },
      ],
      cagri: "HDNodeWallet.fromSeed(seed)",
      aciklama:
        'Seed, "Bitcoin seed" anahtarıyla HMAC-SHA512\'den geçirildi. Çıkan 64 baytın ' +
        "ilk 32 baytı master private key, son 32 baytı chain code oldu. Chain code, alt " +
        "anahtar türetirken kullanılan ek bilgidir; tek başına private key'den alt " +
        "anahtarlar hesaplanamaz.",
    }),

    kart({
      no: 5,
      baslik: "Türetme yolu (BIP32 / BIP44)",
      degerler: [{ deger: c.yol }],
      cagri: `master.derivePath("${YOL}")`,
      hassas: false,
      aciklama:
        "44' = BIP44 düzeni, 60' = Ethereum (SLIP-44 coin tipi), 0' = ilk hesap, " +
        "0 = harici (alıcı) adres zinciri, 0 = ilk adres. Kesme işareti (') hardened " +
        "türetme demektir: alt anahtar ebeveynin private key'inden türetilir, böylece bir " +
        "alt anahtar sızsa bile üst seviyeler hesaplanamaz. MetaMask'in ilk hesabı da " +
        "bu yolu kullanır.",
    }),

    kart({
      no: 6,
      baslik: "Private key (bu yoldaki hesap)",
      degerler: [{ deger: c.privateKey }],
      cagri: "master.derivePath(...).privateKey",
      aciklama:
        "Bu hesabın 32 baytlık (256 bit) gizli anahtarı. İşlemleri bu anahtar imzalar. " +
        "Bu anahtar yalnızca bu tek hesaba erişim verir; 12 kelime ise aynı ağaçtaki " +
        "tüm hesaplara erişim verir.",
    }),

    kart({
      no: 7,
      baslik: "Public key (secp256k1, sıkıştırılmamış)",
      degerler: [{ deger: c.publicKey }],
      cagri: "SigningKey.computePublicKey(privateKey, false)",
      hassas: false,
      aciklama:
        "Public key = private key × G (secp256k1 eğrisinin üreteç noktası). Eliptik eğri " +
        "çarpımı tek yönlüdür; public key'den private key bulunamaz. Biçim: 0x04 öneki + " +
        "X (32 bayt) + Y (32 bayt) = 65 bayt.",
    }),

    kart({
      no: 8,
      baslik: "Ethereum adresi",
      degerler: [
        { etiket: "Keccak-256(public key, 0x04 hariç)", deger: c.keccakOzeti },
        { etiket: "Son 20 bayt", deger: c.hamAdres },
        { etiket: "EIP-55 adres", deger: c.adres },
      ],
      cagri: "keccak256(dataSlice(publicKey, 1)) → dataSlice(özet, 12) → getAddress(...)",
      hassas: false,
      aciklama:
        "Public key'in başındaki 0x04 atıldı, kalan 64 baytın Keccak-256 özeti alındı ve " +
        "son 20 baytı adres oldu. getAddress, EIP-55 kuralına göre bazı harfleri büyük " +
        "yazar; bu, elle yazımdaki hataları yakalayan bir checksum'dır. Sonuç ayrıca " +
        "computeAddress(publicKey) ile çapraz kontrol edildi. Adres paylaşılabilir; " +
        "harcama yetkisi vermez.",
    })
  );

  hepsiniGizleBtn.hidden = false;
  temizleBtn.hidden = false;
});

hepsiniGizleBtn.addEventListener("click", hepsiniGizle);
temizleBtn.addEventListener("click", ekraniTemizle);
