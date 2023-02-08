"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _expressValidator = require("express-validator");
var _WaController = require("../controllers/WaController.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var router = _express["default"].Router();
router.post('/send-message', [(0, _expressValidator.body)('number').notEmpty(), (0, _expressValidator.body)('message').notEmpty()], _WaController.SendMsg);
var _default = router;
exports["default"] = _default;