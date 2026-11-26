// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GfuEvent {
    string public etkinlikAdi = "GfuEvent";
    uint256 public constant KAPASITE = 3;
    uint256 public kayitSayisi;

    mapping(address => string) public takmaAd;
    mapping(address => bool) public kayitliMi;

    function kayitOl(string calldata _takmaAd) external {
        require(bytes(_takmaAd).length > 0, "Takma ad bos olamaz");
        require(!kayitliMi[msg.sender], "Bu adres zaten kayitli");
        require(kayitSayisi < KAPASITE, "Kapasite dolu");

        takmaAd[msg.sender] = _takmaAd;
        kayitliMi[msg.sender] = true;
        kayitSayisi += 1;
    }
}
