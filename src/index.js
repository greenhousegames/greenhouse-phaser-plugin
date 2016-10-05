import firebase from 'firebase';
import Auth from './auth';
import FirebaseReporting from './firebase-reporting';

module.exports = class GreenhousePlugin extends Phaser.Plugin {
  constructor(game, parent) {
    super(game, parent);
  }

  initialize(config) {
    this.name = config.name;
    this.mode = '';
    this.auth = new Auth(config.firebase);

    const metricConfig = JSON.parse(JSON.stringify(config.metrics));
    metricConfig.endedAt = ['first', 'last'];
    metricConfig.played = ['sum'];
    this.reporting = new FirebaseReporting({
      firebase: config.firebase,
      dataPath: 'games',
      reportingPath: 'reporting',
      filters: [['name', 'mode']],
      metrics: metricConfig
    });

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
    this.reporting.setQueryFilter(['name', 'mode'], {
      name: this.name,
      mode: this.mode
    });
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
    let query = this.reporting.refData().orderByChild('endedAt');

    query.limitToLast(1).once('value', (snapshot) => {
      const games = snapshot.val();
      const keys = Object.keys(games);

      if (keys.length > 0) {
        query = query.startAt(games[keys[0]].endedAt + 1);
      }

      // setup listener
      query.on('child_added', (snap) => cb(snap.val()));
      this._queries.push(query);
    });
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
      promises.push(this.reporting.refData().push().set(gamedata));
      promises.push(this.reporting.saveMetrics(gamedata));

      rsvp.all(promises).then(resolve).catch(reject);
    });
    return promise;
  }
};
