"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var phoneNumberFormatter = function phoneNumberFormatter(number) {
  // 1. Menghilangkan karakter selain angka
  var formatted = number.replace(/\D/g, '');

  // 2. Menghilangkan angka 0 di depan (prefix)
  //    Kemudian diganti dengan 62
  if (formatted.startsWith('0')) {
    formatted = "62".concat(formatted.substr(1));
  }
  if (!formatted.endsWith('@c.us')) {
    formatted += '@c.us';
  }
  return formatted;
};
var _default = phoneNumberFormatter;
exports["default"] = _default;