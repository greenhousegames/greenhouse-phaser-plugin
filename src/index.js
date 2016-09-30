import rsvp from 'rsvp';

module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);
  }

  configure(config) {
    this.name = config.name;
    this._firebase = config.firebase;

    const assetPath = config.assetPath || '/';
    this.assetPath = assetPath.lastIndexOf('/') === assetPath.length-1 ? assetPath : assetPath + '/';
  }

  loadAtlas() {
    this.game.load.atlas(this.name, this.assetPath + this.name + '.png', this.assetPath + this.name + '.json');
  }

  waitForAuth() {
    const auth = this.firebase.auth();
    const promise = new rsvp.Promise((resolve) => {
      const callback = () => {
        off();
        resolve();
      };
      const off = auth.onAuthStateChanged(callback);
    });
    return promise;
  }

  firebaseRef(path) {
    return this._firebase.database().ref('games').child(this.name);
  }

  firebaseAuth() {
    return this._firebase.auth();
  }
}
