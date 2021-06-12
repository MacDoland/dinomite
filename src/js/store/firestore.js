import firebaseConfig from '../config/firebase-config';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

class FirestoreDatabase {
    #database;
    #key;
    #hasAuthed;
    constructor(key) {
        this.#key = key;
        this.#database = firebase.database;
        this.#hasAuthed = false;

        firebase.initializeApp(firebaseConfig);

        firebase.auth().signInAnonymously()
            .then(() => {
                this.#hasAuthed = true;
            })
            .catch((error) => {
                //error with auth
                console.error(error);
            });
    }

    get() {
        return new Promise((resolve, reject) => {
            const dbRef = this.#database().ref(this.#key);
            dbRef.get().then((snapshot) => {
                if (snapshot.exists()) {
                    resolve(JSON.parse(snapshot.val()));
                } else {
                    console.log("No data available");
                    resolve(JSON.parse([]));
                }
            }).catch((error) => {
                reject(error);
            });
        })
    }

    set(entry) {
        return new Promise((resolve, reject) => {
            firebase.auth().signInAnonymously()
                .then(() => {
                    this.#hasAuthed = true;

                    if (this.#hasAuthed) {
                        this.get().then((highscores) => {
                            highscores.push(entry);
                            const dbRef = this.#database().ref(this.#key);
                            dbRef.set(JSON.stringify(highscores));
                            resolve();
                        })
                    }
                })
                .catch((error) => {
                    //error with auth
                    reject(error);
                });
        })
    }
}

export default FirestoreDatabase;