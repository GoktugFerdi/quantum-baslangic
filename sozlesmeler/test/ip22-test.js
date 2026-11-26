// İP 21 / İP 22 denemelerini yerel bir EVM'de (ganache) çalıştıran test betiği.
// Sepolia'ya hiçbir şey gönderilmez.
// Kurulum: npm i solc@0.8.28 ganache@7 ethers@6
// Çalıştırma: node ip22-test.js ../GfuEvent.sol
// Not: ganache eski EVM sürümünü bildiği için derleme evmVersion 'paris' ile yapılır.
// GfuEvent İP 21 + İP 22 denemeleri: yerel EVM (ganache), Sepolia'ya hiçbir şey gönderilmez.
const solc = require('solc'), fs = require('fs');
const ganache = require('ganache');
const { ethers } = require('ethers');

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const out = JSON.parse(solc.compile(JSON.stringify({
  language: 'Solidity', sources: { 'G.sol': { content: src } },
  settings: { evmVersion: 'paris', outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } }
})));
if (out.errors && out.errors.some(e => e.severity === 'error')) { console.log(out.errors); process.exit(1); }
const c = out.contracts['G.sol'].GfuEvent;

(async () => {
  const provider = new ethers.BrowserProvider(ganache.provider({ logging: { quiet: true }, wallet: { totalAccounts: 5, deterministic: true } }));
  const s = [];
  for (let i = 0; i < 5; i++) s.push(await provider.getSigner(i));
  const addr = await Promise.all(s.map(x => x.getAddress()));
  const f = new ethers.ContractFactory(c.abi, '0x' + c.evm.bytecode.object, s[0]);
  const g = await f.deploy(); await g.waitForDeployment();
  const at = i => g.connect(s[i]);
  const log = [];
  const names = ['Hesap 1', 'Hesap 2', 'Hesap 3', 'Hesap 4', 'Hesap 5'];
  async function tx(label, i, fn, ...args) {
    try {
      const r = await (await at(i)[fn](...args)).wait();
      const evs = r.logs.map(l => { try { return g.interface.parseLog(l); } catch { return null; } }).filter(Boolean)
        .map(e => e.name + '(' + e.args.map(a => String(a)).join(', ') + ')');
      log.push([label, 'KABUL', evs.join('; ') || '-']);
      console.log('KABUL', label, evs.join('; '));
    } catch (e) {
      const reason = e.reason || (e.info && e.info.error && e.info.error.message) || e.shortMessage || e.message;
      log.push([label, 'RET', reason]);
      console.log('RET  ', label, '|', reason);
    }
  }
  const st = async (extra = {}) => {
    const o = { kayitSayisi: String(await g.kayitSayisi()) };
    for (const [k, a] of Object.entries(extra)) o[k] = String(await g[k](a));
    return o;
  };
  console.log('gorevli == Hesap 1 :', (await g.gorevli()) === addr[0], '| KAPASITE:', String(await g.KAPASITE()), '| etkinlikAdi:', await g.etkinlikAdi());
  console.log('--- İP 21 kayıt/kapasite denemeleri ---');
  await tx('21-1 Hesap 2 ilk gecerli kayit', 1, 'kayitOl', 'goktug');   console.log('   toplam', await g.kayitSayisi());
  await tx('21-2 Hesap 2 tekrar kayit', 1, 'kayitOl', 'goktug2');        console.log('   toplam', await g.kayitSayisi());
  await tx('21-3 Hesap 3 bos ad', 2, 'kayitOl', '');                     console.log('   toplam', await g.kayitSayisi());
  await tx('21-4a Hesap 3 gecerli kayit', 2, 'kayitOl', 'ali');
  await tx('21-4b Hesap 1 gecerli kayit', 0, 'kayitOl', 'ferdi');        console.log('   toplam', await g.kayitSayisi());
  await tx('21-5 Hesap 4 dorduncu kayit', 3, 'kayitOl', 'veli');         console.log('   toplam', await g.kayitSayisi());
  console.log('--- İP 22 giriş denemeleri ---');
  await tx('22-1 gorevli (H1) kayitli H2 ye giris verir', 0, 'girisYap', addr[1]);
  console.log('   girisYaptiMi(H2) =', await g.girisYaptiMi(addr[1]));
  await tx('22-2 gorevli olmayan (H3) giris verir', 2, 'girisYap', addr[2]);
  console.log('   girisYaptiMi(H3) =', await g.girisYaptiMi(addr[2]));
  await tx('22-3 gorevli kayitsiz H4 e giris verir', 0, 'girisYap', addr[3]);
  console.log('   girisYaptiMi(H4) =', await g.girisYaptiMi(addr[3]));
  await tx('22-4 H2 ye ikinci giris', 0, 'girisYap', addr[1]);
  console.log('   girisYaptiMi(H2) =', await g.girisYaptiMi(addr[1]), '(ilk giris korundu)');
  try { await at(0).girisYap.staticCall(addr[1]); console.log('   staticCall: BASARILI (beklenmiyordu)'); }
  catch (e) { console.log('   22-4 revert nedeni (staticCall):', e.revert ? e.revert.args[0] : (e.info && e.info.error && e.info.error.message) || e.shortMessage); }
  console.log('--- Önceki kontroller İP 22 sürümünde tekrar ---');
  console.log('   kayitSayisi =', await g.kayitSayisi(), '| takmaAd(H2) =', await g.takmaAd(addr[1]), '| takmaAd(H1) =', await g.takmaAd(addr[0]), '| kayitliMi(H4) =', await g.kayitliMi(addr[3]));
  // gorevli de kayıtlı olunca kendi girişini de verebilir mi? (bilgi amaçlı)
  await tx('ek: gorevli kendi kaydina (H1) giris verir', 0, 'girisYap', addr[0]);
  console.log('   girisYaptiMi(H1) =', await g.girisYaptiMi(addr[0]));
  fs.writeFileSync('ip22-sonuc.json', JSON.stringify(log, null, 1));
})();
