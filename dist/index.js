'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rsvp = require('rsvp');

var _rsvp2 = _interopRequireDefault(_rsvp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (_Phaser$Plugin) {
  _inherits(GreenhousePlugin, _Phaser$Plugin);

  function GreenhousePlugin(game, parent) {
    _classCallCheck(this, GreenhousePlugin);

    return _possibleConstructorReturn(this, (GreenhousePlugin.__proto__ || Object.getPrototypeOf(GreenhousePlugin)).call(this, game, parent));
  }

  _createClass(GreenhousePlugin, [{
    key: 'configure',
    value: function configure(config) {
      this.name = config.name;
      this._firebase = config.firebase;

      var assetPath = config.assetPath || '/';
      this.assetPath = assetPath.lastIndexOf('/') === assetPath.length - 1 ? assetPath : assetPath + '/';
    }
  }, {
    key: 'loadAtlas',
    value: function loadAtlas() {
      this.game.load.atlas(this.name, this.assetPath + this.name + '.png', this.assetPath + this.name + '.json');
    }
  }, {
    key: 'waitForAuth',
    value: function waitForAuth() {
      var auth = this.firebase.auth();
      var promise = new _rsvp2.default.Promise(function (resolve) {
        var callback = function callback() {
          off();
          resolve();
        };
        var off = auth.onAuthStateChanged(callback);
      });
      return promise;
    }
  }, {
    key: 'firebaseRef',
    value: function firebaseRef(path) {
      return this._firebase.database().ref('games').child(this.name);
    }
  }, {
    key: 'firebaseAuth',
    value: function firebaseAuth() {
      return this._firebase.auth();
    }
  }]);

  return GreenhousePlugin;
}(Phaser.Plugin);