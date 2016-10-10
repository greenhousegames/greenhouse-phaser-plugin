import Auth from './auth';

module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);
  }

  initialize(config) {
    this.name = config.name;
    this.mode = '';
    this.firebase = config.firebase;
    this.auth = new Auth(config.firebase);

    const assetPath = config.assetPath || '/';
    this.assetPath = assetPath.lastIndexOf('/') === assetPath.length-1 ? assetPath : assetPath + '/';

    if (config.responsive) {
      this.responsive = {
        register: (callback, context) => {
          this.game.scale.onSizeChange.add(callback, context);
        },
        unregister: (callback, context) => {
          this.game.scale.onSizeChange.remove(callback, context);
        },
        size: ''
      };
      this.game.scale.setResizeCallback(this.resizeDevice, this);
      this.resizeDevice();
    }

    this.setMode('standard');
  }

  setMode(mode) {
    this.mode = mode;
  }

  updateSettings(width/*, height */) {
    // responsive sizes
    if (width >= 1200) {
      this.responsive.size = 'large';
    } else if (width >= 640) {
      this.responsive.size = 'medium';
    } else {
      this.responsive.size = 'small';
    }
  }

  resizeDevice() {
    this.updateSettings(window.innerWidth, window.innerHeight);
    this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
  }

  loadAtlas() {
    this.game.load.atlas(this.name, this.assetPath + this.name + '.png', this.assetPath + this.name + '.json');
  }

  refData() {
    return this.firebase.database().ref('games').child(this.name).child('data');
  }

  refReporting() {
    return this.firebase.database().ref('games').child(this.name).child('reporting');
  }
};
