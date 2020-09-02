const { db } = require('../utils/admin');
const config = require('../utils/config');
const firebase = require('firebase');
firebase.initializeApp(config);

//SIGNUP USER
exports.signup = (req, res) => {
    const newUser = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }
    let token, userId;

    db.doc(`/users/${newUser.username}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ user: 'This user is already taken' })
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                createdAt: new Date().toISOString(),
                userId
            }
            db.doc(`/users/${newUser.username}`).set(userCredentials)
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' });
            }
            else {
                return res.status(500).json({ general: 'Something went wrong , please try again' });
            }
        })




}

//LOGIN USER
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.status(200).json({ token })
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({ message: 'Wrong credentials' })
        })
}

exports.getUser = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.username}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.user = doc.data();
                return db.collection('ideas').where('username', '==', req.params.username).get()
            } else {
                return res.status(404).json({ error: 'User not found' })
            }
        })
        .then(data => {
            userData.ideas = [];
            data.forEach(doc => {
                userData.ideas.push({
                    num: doc.data().num,
                    shortDescription: doc.data().shortDescription,
                    longDescription: doc.data().longDescription,
                    rate: doc.data().rate,
                    expetacions: doc.data().expetacions,
                    createdAt: doc.data().createdAt,
                    category: doc.data().category,
                    username: doc.data().username,
                    ideaId: doc.id
                });
            })
            return res.json(userData);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        })
}