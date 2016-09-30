class GreenhousePlugin extends Phaser.Plugin {
  configure(config) {
    this.gameid = config.id;
    this.firebase = config.firebase.child('games').child(this.gameid);
  }
}

export default GreenhousePlugin;
