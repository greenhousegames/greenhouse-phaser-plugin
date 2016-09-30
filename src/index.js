module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);
  }

  configure(config) {
    this.gameid = config.id;
    this.firebase = config.firebase.child('games').child(this.gameid);
  }
}
