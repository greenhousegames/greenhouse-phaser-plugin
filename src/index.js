import firebase from 'firebase';
import rsvp from 'rsvp';
import Auth from './auth';

module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);

    this.gamePlayedListener = null;
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

  onGamePlayed(cb) {
    this.offGamePlayed();
    let query = this.refData().orderByChild('endedAt');

    query.limitToLast(1).once('value', (snapshot) => {
      const games = snapshot.val();
      const keys = games ? Object.keys(games) : null;

      if (keys && keys.length > 0) {
        query = query.startAt(games[keys[0]].endedAt + 1);
      }

      // setup listener
      query.on('child_added', (snap) => cb(snap.val()));
      this.gamePlayedListener = query;
    });
  }

  offGamePlayed() {
    if (this.gamePlayedListener) {
      this.gamePlayedListener.off('child_added');
    }
    this.gamePlayedListener = null;
  }

  saveGamePlayed(data) {
    const origKeys = Object.keys(data);
    const gamedata = {
      endedAt: firebase.database.ServerValue.TIMESTAMP,
      uid: this.auth.currentUserUID(),
      mode: this.mode,
      name: this.name,
      played: 1
    };
    origKeys.forEach((key) => {
      gamedata[key] = data[key];
    });

    const promise = new rsvp.Promise((resolve, reject) => {
      const promises = [];
      promises.push(this.refData().push().set(gamedata));
      promises.push(this.reporting.saveMetrics(gamedata));

      rsvp.all(promises).then(resolve).catch(reject);
    });
    return promise;
  }

  refData() {
    return this.firebase.database().ref('data');
  }

  destroy() {
    this.offGamePlayed();

    super.destroy();
  }
};
