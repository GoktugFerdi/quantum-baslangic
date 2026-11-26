// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GfuEvent {
    // Etkinliğin adı
    string public etkinlikAdi = "GfuEvent";

    // Adres -> takma ad. Veri burada, sözleşmenin state'inde tutulur.
    mapping(address => string) public takmaAd;

    // Kullanıcı yalnızca kendi adresi adına kayıt yapar
    function kayitOl(string calldata _takmaAd) external {
        takmaAd[msg.sender] = _takmaAd;
    }
}
