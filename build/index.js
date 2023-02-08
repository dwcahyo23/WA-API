"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _express = _interopRequireDefault(require("express"));
var _socket = require("socket.io");
var _qrcode = _interopRequireDefault(require("qrcode"));
var _http = require("http");
var dotenv = _interopRequireWildcard(require("dotenv"));
var _cors = _interopRequireDefault(require("cors"));
var _morgan = _interopRequireDefault(require("morgan"));
var _WaConfig = _interopRequireDefault(require("./config/WaConfig"));
var _WaRouter = _interopRequireDefault(require("./routers/WaRouter"));
var _path = _interopRequireDefault(require("path"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/* eslint-disable import/no-extraneous-dependencies */

dotenv.config();
var port = process.env.PORT;
var app = (0, _express["default"])();
app.use((0, _morgan["default"])('dev'));
var httpServer = (0, _http.createServer)(app);
var io = new _socket.Server(httpServer);
app.use((0, _cors["default"])());
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: true
}));
app.use(_WaRouter["default"]);
app.get('/', function (req, res) {
  res.sendFile('index.html', {
    root: _path["default"].join(__dirname, '../public')
  });
});
io.on('connection', function (socket) {
  socket.emit('message', 'Connecting...');
  _WaConfig["default"].on('qr', function (qr) {
    console.log('QR RECEIVED', qr);
    _qrcode["default"].toDataURL(qr, function (err, url) {
      socket.emit('qr', url);
      socket.emit('message', 'QR code received, scan please!');
    });
  });
  _WaConfig["default"].on('ready', function () {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });
  _WaConfig["default"].on('authenticated', function () {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated');
    console.log('AUTHENTICATED');
  });
  _WaConfig["default"].on('auth_failure', function () {
    socket.emit('message', 'Auth failure, restartig..');
  });
  _WaConfig["default"].on('disconnected', function () {
    socket.emit('message', 'Whatsapp is disconnected!');
    _WaConfig["default"].destroy();
    _WaConfig["default"].initialize();
  });
});
httpServer.listen(port, function () {
  console.log("Server up & running in ".concat(port));
});