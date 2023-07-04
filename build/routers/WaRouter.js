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
router.post('/send-message-group', [(0, _expressValidator.body)('id').custom(function (value, _ref) {
  var req = _ref.req;
  if (!value && !req.body.name) {
    throw new Error('Invalid value, you can use `id` or `name`');
  }
  return true;
}), (0, _expressValidator.body)('message').notEmpty()], _WaController.SendMsgGroup);
router.post('/send-message-group-mentions', [(0, _expressValidator.body)('id').custom(function (value, _ref2) {
  var req = _ref2.req;
  if (!value && !req.body.name) {
    throw new Error('Invalid value, you can use `id` or `name`');
  }
  return true;
}), (0, _expressValidator.body)('message').notEmpty()], _WaController.SendMsgGroupMentions);
var _default = router;
exports["default"] = _default;