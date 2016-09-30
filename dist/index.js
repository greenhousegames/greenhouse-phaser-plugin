'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _firebaseGameStorage = require('@greenhousegames/firebase-game-storage');

var _firebaseGameStorage2 = _interopRequireDefault(_firebaseGameStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (_Phaser$Plugin) {
  _inherits(GreenhousePlugin, _Phaser$Plugin);

  function GreenhousePlugin(game, parent) {
    _classCallCheck(this, GreenhousePlugin);

    var _this = _possibleConstructorReturn(this, (GreenhousePlugin.__proto__ || Object.getPrototypeOf(GreenhousePlugin)).call(this, game, parent));

    _this.layout = {
      size: ''
    };
    return _this;
  }

  _createClass(GreenhousePlugin, [{
    key: 'initialize',
    value: function initialize(config) {
      this.name = config.name;
      this.storage = new _firebaseGameStorage2.default(config.name, config.firebase);

      var assetPath = config.assetPath || '/';
      this.assetPath = assetPath.lastIndexOf('/') === assetPath.length - 1 ? assetPath : assetPath + '/';

      this.enableResponsive = !!config.responsive;
      if (this.enableResponsive) {
        this.game.scale.setResizeCallback(this.resizeDevice, this);
        this.resizeDevice();
      }
    }
  }, {
    key: 'updateSettings',
    value: function updateSettings(width /*, height */) {
      // responsive sizes
      if (width >= 1200) {
        this.layout.size = 'large';
      } else if (width >= 640) {
        this.layout.size = 'medium';
      } else {
        this.layout.size = 'small';
      }
    }
  }, {
    key: 'resizeDevice',
    value: function resizeDevice() {
      this.updateSettings(window.innerWidth, window.innerHeight);
      this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
    }
  }, {
    key: 'loadAtlas',
    value: function loadAtlas() {
      this.game.load.atlas(this.name, this.assetPath + this.name + '.png', this.assetPath + this.name + '.json');
    }
  }]);

  return GreenhousePlugin;
}(Phaser.Plugin);