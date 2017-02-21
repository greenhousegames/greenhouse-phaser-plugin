class Auth {
  constructor(firebase) {
    this._firebase = firebase;
  }

  currentUser() {
    return this.firebaseAuth().currentUser;
  }

  currentUserUID() {
    return this.firebaseAuth().currentUser ? this.firebaseAuth().currentUser.uid : '';
  }

  firebaseAuth() {
    return this._firebase.auth();
  }

  waitForAuth() {
    const auth = this.firebaseAuth();
    const promise = new Promise((resolve) => {
      const callback = () => {
        off();
        resolve();
      };
      const off = auth.onAuthStateChanged(callback);
    });
    return promise;
  }

  requireAuth() {
    const promise = new Promise((resolve, reject) => {
      this.waitForAuth().then(() => {
        if (!this.firebaseAuth().currentUser) {
          this.firebaseAuth().signInAnonymously().then(resolve).catch(reject);
        } else {
          resolve();
        }
      }).catch(reject);
    });
    return promise;
  }

  onAuthChanged(cb) {
    this.firebaseAuth().onAuthStateChanged((auth) => {
      cb(auth);
    });
  }
}

module.exports = Auth;
