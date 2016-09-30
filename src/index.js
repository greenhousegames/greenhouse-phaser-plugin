module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);
  }

  configure(config) {
    this.name = config.name;
    this.firebase = config.firebase;

    const assetPath = config.assetPath || '/';
    this.assetPath = assetPath.lastIndexOf('/') === assetPath.length-1 ? assetPath : assetPath + '/';

    this.adUrl = config.adUrl || '';
  }

  initalize() {
    // enable ads plugin
    this.game.add.plugin(Fabrique.Plugins.AdManager);
    const provider = new Fabrique.AdProvider.Ima3(this.game, this.adUrl);
    this.game.ads.setAdProvider(provider);
  }
}
