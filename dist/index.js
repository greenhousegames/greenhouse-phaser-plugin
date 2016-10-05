'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _firebaseReporting = require('firebase-reporting');

var _firebaseReporting2 = _interopRequireDefault(_firebaseReporting);

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

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
    key: 'initialize',
    value: function initialize(config) {
      var _this2 = this;

      this.name = config.name;
      this.mode = '';
      this.auth = new _auth2.default(config.firebase);

      var metricConfig = JSON.parse(JSON.stringify(config.metrics));
      metricConfig.endedAt = ['first', 'last'];
      metricConfig.played = ['sum'];
      this.reporting = new _firebaseReporting2.default({
        firebase: config.firebase,
        dataPath: 'games',
        reportingPath: 'reporting',
        filters: [['name', 'mode']],
        metrics: metricConfig
      });

      var assetPath = config.assetPath || '/';
      this.assetPath = assetPath.lastIndexOf('/') === assetPath.length - 1 ? assetPath : assetPath + '/';

      if (config.responsive) {
        this.responsive = {
          register: function register(callback, context) {
            _this2.game.scale.onSizeChange.add(callback, context);
          },
          unregister: function unregister(callback, context) {
            _this2.game.scale.onSizeChange.remove(callback, context);
          },
          size: ''
        };
        this.game.scale.setResizeCallback(this.resizeDevice, this);
        this.resizeDevice();
      }

      this.setMode('standard');
    }
  }, {
    key: 'setMode',
    value: function setMode(mode) {
      this.mode = mode;
      this.reporting.setQueryFilter(['name', 'mode'], {
        name: this.name,
        mode: this.mode
      });
    }
  }, {
    key: 'updateSettings',
    value: function updateSettings(width /*, height */) {
      // responsive sizes
      if (width >= 1200) {
        this.responsive.size = 'large';
      } else if (width >= 640) {
        this.responsive.size = 'medium';
      } else {
        this.responsive.size = 'small';
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
  }, {
    key: 'onGamePlayed',
    value: function onGamePlayed(cb) {
      var _this3 = this;

      var query = this.reporting.refData().orderByChild('endedAt');

      query.limitToLast(1).once('value', function (snapshot) {
        var games = snapshot.val();
        var keys = Object.keys(games);

        if (keys.length > 0) {
          query = query.startAt(games[keys[0]].endedAt + 1);
        }

        // setup listener
        query.on('child_added', function (snap) {
          return cb(snap.val());
        });
        _this3._queries.push(query);
      });
    }
  }, {
    key: 'saveGamePlayed',
    value: function saveGamePlayed(data) {
      var _this4 = this;

      var origKeys = Object.keys(data);
      var gamedata = {
        endedAt: _firebase2.default.database.ServerValue.TIMESTAMP,
        uid: this.auth.currentUserUID(),
        mode: this.mode,
        name: this.name,
        played: 1
      };
      origKeys.forEach(function (key) {
        gamedata[key] = data[key];
      });

      var promise = new rsvp.Promise(function (resolve, reject) {
        var promises = [];
        promises.push(_this4.reporting.refData().push().set(gamedata));
        promises.push(_this4.reporting.saveMetrics(gamedata));

        rsvp.all(promises).then(resolve).catch(reject);
      });
      return promise;
    }
  }]);

  return GreenhousePlugin;
}(Phaser.Plugin);