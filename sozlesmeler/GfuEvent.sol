// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GfuEvent {
    string public etkinlikAdi = "GfuEvent";
    uint256 public constant KAPASITE = 3;
    uint256 public kayitSayisi;
    address public gorevli;

    mapping(address => string) public takmaAd;
    mapping(address => bool) public kayitliMi;
    mapping(address => bool) public girisYaptiMi;

    event KayitYapildi(address indexed katilimci, string ad);
    event GirisYapildi(address indexed katilimci);

    // Sözleşmeyi deploy eden adres görevli olur
    constructor() {
        gorevli = msg.sender;
    }

    function kayitOl(string calldata _takmaAd) external {
        require(bytes(_takmaAd).length > 0, "Takma ad bos olamaz");
        require(!kayitliMi[msg.sender], "Bu adres zaten kayitli");
        require(kayitSayisi < KAPASITE, "Kapasite dolu");

        takmaAd[msg.sender] = _takmaAd;
        kayitliMi[msg.sender] = true;
        kayitSayisi += 1;

        emit KayitYapildi(msg.sender, _takmaAd);
    }

    // Yalnızca görevli, kayıtlı bir katılımcıyı "giriş yaptı" olarak işaretleyebilir
    function girisYap(address katilimci) external {
        require(msg.sender == gorevli, "Sadece gorevli giris verebilir");
        require(kayitliMi[katilimci], "Adres kayitli degil");
        require(!girisYaptiMi[katilimci], "Giris zaten yapildi");

        girisYaptiMi[katilimci] = true;

        emit GirisYapildi(katilimci);
    }
}
