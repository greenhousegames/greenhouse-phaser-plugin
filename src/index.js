import GameStorage from '@greenhousegames/firebase-game-storage';

module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);
    this.layout = {
      size: ''
    };
  }

  initialize(config) {
    this.name = config.name;
    this.storage = new GameStorage(config.name, config.firebase);

    const assetPath = config.assetPath || '/';
    this.assetPath = assetPath.lastIndexOf('/') === assetPath.length-1 ? assetPath : assetPath + '/';

    this.enableResponsive = !!config.responsive;
    if (this.enableResponsive) {
      this.game.scale.setResizeCallback(this.resizeDevice, this);
      this.resizeDevice();
    }
  }

  updateSettings(width/*, height */) {
    // responsive sizes
    if (width >= 1200) {
      this.layout.size = 'large';
    } else if (width >= 640) {
      this.layout.size = 'medium';
    } else {
      this.layout.size = 'small';
    }
  }

  resizeDevice() {
    this.updateSettings(window.innerWidth, window.innerHeight);
    this.game.scale.setGameSize(window.innerWidth, window.innerHeight);
  }

  loadAtlas() {
    this.game.load.atlas(this.name, this.assetPath + this.name + '.png', this.assetPath + this.name + '.json');
  }
};
