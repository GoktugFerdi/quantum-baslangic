// İP 13 paneli: kelimelerden adres bulma + checksum deneyi.
// Girilen kelimeler yalnızca bu sayfanın belleğinde kalır; hiçbir yere gönderilmez.

import {
  ifadeyiTemizle,
  mnemonicDogrula,
  kelimelerdenAdres,
  tekKelimeDegistir,
  checksumIstatistigi,
  kelimeListesi,
} from "./cuzdan.js";

const TEST_IFADESI =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

export function dogrulamaPaneli(kok) {
  kok.innerHTML = `
    <h2 class="panel-baslik">Kelimelerden adres bul ve checksum deneyi (İP 13)</h2>
    <p class="uyari">
      <strong>Adres karşılaştırması</strong> için eğitim kelimelerinizi girebilirsiniz; ekran
      görüntüsünde yalnızca adres kartı görünsün. <strong>Checksum deneyi</strong> için asıl
      kelimelerinizi değil, test ifadesini kullanın.
    </p>

    <section class="kart">
      <label for="kelimeGirdi" class="alan-etiketi">12 kelime (numaralı ya da numarasız yazabilirsiniz)</label>
      <div class="deger-satiri">
        <textarea id="kelimeGirdi" class="maskeli" rows="3"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
        <button id="girdiGoster" class="goster">Göster</button>
      </div>
      <div class="dugmeler">
        <button id="dogrulaBtn">Doğrula ve adresi bul</button>
        <button id="testDoldurBtn" class="ikincil">Test ifadesini doldur (abandon … about)</button>
        <button id="girdiTemizleBtn" class="ikincil">Temizle</button>
      </div>
      <p id="dogrulamaSonucu" class="sonuc" hidden></p>
    </section>

    <section id="adresKarti" class="kart" hidden>
      <h2>
        <span class="baslik">Bu kelimelerin ilk hesabı</span>
        <span class="etiket acik-etiket">Paylaşılabilir</span>
      </h2>
      <div class="deger-satiri"><code id="bulunanAdres" class="deger"></code></div>
      <p class="aciklama">
        Yol: <code id="bulunanYol"></code>, passphrase boş. MetaMask'teki “Account 1” adresiyle
        karşılaştırın. EIP-55 harf düzeni farklı görünse bile 20 bayt aynıysa adres aynıdır.
      </p>
    </section>

    <section id="deneyKarti" class="kart" hidden>
      <h2><span class="baslik">Checksum deneyi: tek kelime değiştir</span></h2>
      <p class="aciklama">
        Yukarıdaki geçerli ifadenin bir kelimesini listedeki başka bir kelimeyle değiştirin.
        Tablo, eski kelimeyi göstermez; yalnızca sıra numarasını, yeni kelimeyi ve sonucu kaydeder.
      </p>
      <div class="deney-satiri">
        <label>Sıra
          <select id="deneySira">${Array.from({ length: 12 }, (_, i) => `<option>${i + 1}</option>`).join("")}</select>
        </label>
        <label>Yeni kelime
          <input id="deneyKelime" list="bip39Liste" autocomplete="off" spellcheck="false" />
        </label>
        <button id="deneBtn">Dene</button>
        <button id="rastgeleBtn" class="ikincil">Rastgele kelimeyle dene</button>
      </div>
      <datalist id="bip39Liste"></datalist>
      <table id="deneyTablosu" hidden>
        <thead><tr><th>#</th><th>Sıra</th><th>Yeni kelime</th><th>Sonuç</th></tr></thead>
        <tbody></tbody>
      </table>

      <h3>Tüm olasılıkları say</h3>
      <p class="aciklama">
        Her sıradaki kelime, listedeki diğer 2047 kelimeyle tek tek değiştirilir ve kaç değişikliğin
        yine “geçerli” sayıldığı sayılır (12 × 2047 = 24.564 deneme).
      </p>
      <button id="sayBtn" class="ikincil">Say</button>
      <div id="istatistik"></div>
    </section>
  `;

  const $ = (s) => kok.querySelector(s);
  const girdi = $("#kelimeGirdi");
  const sonuc = $("#dogrulamaSonucu");
  const adresKarti = $("#adresKarti");
  const deneyKarti = $("#deneyKarti");
  const tablo = $("#deneyTablosu");
  const liste = kelimeListesi();
  let gecerliKelimeler = null; // son doğrulanan geçerli ifade
  let denemeNo = 0;

  // Datalist: yeni kelime alanında BIP39 listesinden öneri
  const dl = $("#bip39Liste");
  for (const k of liste) {
    const o = document.createElement("option");
    o.value = k;
    dl.append(o);
  }

  $("#girdiGoster").addEventListener("click", (e) => {
    const maskeli = girdi.classList.toggle("maskeli");
    e.target.textContent = maskeli ? "Göster" : "Gizle";
  });

  function sonucYaz(mesaj, iyi) {
    sonuc.hidden = false;
    sonuc.textContent = (iyi ? "✓ " : "✗ ") + mesaj;
    sonuc.className = "sonuc " + (iyi ? "iyi" : "kotu");
  }

  function deneyiSifirla() {
    denemeNo = 0;
    tablo.querySelector("tbody").replaceChildren();
    tablo.hidden = true;
    $("#istatistik").replaceChildren();
  }

  $("#dogrulaBtn").addEventListener("click", () => {
    const kelimeler = ifadeyiTemizle(girdi.value);
    const d = mnemonicDogrula(kelimeler);
    deneyiSifirla();
    if (!d.gecerli) {
      gecerliKelimeler = null;
      adresKarti.hidden = true;
      deneyKarti.hidden = true;
      sonucYaz(d.mesaj, false);
      return;
    }
    gecerliKelimeler = kelimeler;
    const { adres, yol } = kelimelerdenAdres(kelimeler);
    $("#bulunanAdres").textContent = adres;
    $("#bulunanYol").textContent = yol;
    adresKarti.hidden = false;
    deneyKarti.hidden = false;
    sonucYaz(d.mesaj, true);
  });

  $("#testDoldurBtn").addEventListener("click", () => {
    girdi.value = TEST_IFADESI;
    $("#dogrulaBtn").click();
  });

  $("#girdiTemizleBtn").addEventListener("click", () => {
    girdi.value = "";
    gecerliKelimeler = null;
    sonuc.hidden = true;
    adresKarti.hidden = true;
    deneyKarti.hidden = true;
    deneyiSifirla();
  });

  function dene(sira, yeniKelime) {
    if (!gecerliKelimeler) return;
    const d = tekKelimeDegistir(gecerliKelimeler, sira, yeniKelime);
    const tr = document.createElement("tr");
    const sonucMetni = d.gecerli
      ? "KABUL – checksum tuttu, ama bu FARKLI bir cüzdan"
      : d.neden === "checksum"
        ? "RET – checksum tutmadı"
        : "RET – " + d.mesaj;
    for (const h of [++denemeNo, sira, yeniKelime, sonucMetni]) {
      const td = document.createElement("td");
      td.textContent = h;
      tr.append(td);
    }
    tr.className = d.gecerli ? "kabul" : "ret";
    tablo.querySelector("tbody").append(tr);
    tablo.hidden = false;
  }

  $("#deneBtn").addEventListener("click", () => {
    const k = $("#deneyKelime").value.trim().toLowerCase();
    if (!k) return;
    dene(Number($("#deneySira").value), k);
  });

  $("#rastgeleBtn").addEventListener("click", () => {
    if (!gecerliKelimeler) return;
    const sira = Number($("#deneySira").value);
    let k;
    do {
      k = liste[crypto.getRandomValues(new Uint16Array(1))[0] % 2048];
    } while (k === gecerliKelimeler[sira - 1]);
    dene(sira, k);
  });

  $("#sayBtn").addEventListener("click", () => {
    if (!gecerliKelimeler) return;
    const kutu = $("#istatistik");
    kutu.textContent = "Sayılıyor…";
    // Ekran "Sayılıyor…" yazısını çizebilsin diye hesaplamayı bir sonraki kareye bırak.
    setTimeout(() => {
      const satirlar = checksumIstatistigi(gecerliKelimeler);
      const toplam = satirlar.reduce((a, s) => a + s.gecerli, 0);
      const t = document.createElement("table");
      t.innerHTML = "<thead><tr><th>Sıra</th><th>Denenen</th><th>Geçerli çıkan</th><th>Oran</th></tr></thead>";
      const tb = document.createElement("tbody");
      for (const s of [...satirlar, { sira: "Toplam", denenen: 12 * 2047, gecerli: toplam }]) {
        const tr = document.createElement("tr");
        for (const h of [s.sira, s.denenen, s.gecerli, ((100 * s.gecerli) / s.denenen).toFixed(2) + " %"]) {
          const td = document.createElement("td");
          td.textContent = h;
          tr.append(td);
        }
        tb.append(tr);
      }
      t.append(tb);
      const not = document.createElement("p");
      not.className = "aciklama";
      not.textContent =
        `Beklenen oran 1/16 = %6,25 (checksum 4 bit). Ölçülen: %${((100 * toplam) / (12 * 2047)).toFixed(2)}. ` +
        "12. kelimede 7 bit entropi + 4 bit checksum vardır; bu yüzden orada tam 2⁷ − 1 = 127 değişiklik geçerli çıkar.";
      kutu.replaceChildren(t, not);
    }, 20);
  });
}
