const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./utils/config');
const app = require('express')();
var serviceAccount = require("./be-creative-dd183-firebase-adminsdk-r0bfa-2542e2a2f6.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://be-creative-dd183.firebaseio.com"
});

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

const cors = require('cors');
app.use(cors());

app.post('/newIdea', (req, res) => {
    const newIdea = {
        num: req.body.num,
        shortDescription: req.body.shortDescription,
        longDescription: req.body.longDescription,
        rate: req.body.rate,
        expetacions: req.body.expetacions,
        createdAt: new Date().toISOString(),
        category: req.body.category
    }

    db
        .collection("ideas")
        .add(newIdea)
        .then(doc => {
            const resIdea = newIdea;
            resIdea.ideaId = doc.id;
            return res.status(200).json(resIdea);
        })
        .then(() => {
            return db
                .doc(`categories/${req.body.category}`)
                .collection('ideas')
                .doc(`${newIdea.ideaId}`).set({ newIdea }, { merge: true });
        })
        .catch(err => {
            res.status(500).json({ message: `Something went wrong` })
            console.log(err)
        })
});

app.get('/ideas', (req, res) => {
    db.collection("ideas")
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let ideas = [];
            data.forEach(doc => {
                ideas.push({
                    ideaId: doc.id,
                    num: doc.data().num,
                    shortDescription: doc.data().shortDescription,
                    longDescription: doc.data().longDescription,
                    rate: doc.data().rate,
                    expetacions: doc.data().expetacions,
                    createdAt: new Date().toISOString(),
                    category: doc.data().category
                })
            })
            return res.status(200).json(ideas)
        })
        .catch(err => {
            res.status(500).json({ message: `Something went wrong` })
            console.log(err)
        })
});

app.get('/ideas/:ideaId', (req, res) => {
    let ideaData = {}
    db.doc(`/ideas/${req.params.ideaId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Idea not found' })
            }
            ideaData = doc.data();
            ideaData.ideaId = doc.id;
            return res.json(ideaData);
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
});

app.delete('/ideas/:ideaId', (req, res) => {
    const document = db.doc(`/ideas/${req.params.ideaId}`);
    document.delete()
        .then(() => res.status(200).json({ message: 'Idea delete successfully' }))
        .catch(err => res.status(400).json({ error: err.code }))
});

app.put('/ideas/:ideaId', (req, res) => {
    const updatedIdea = {
        num: req.body.num,
        shortDescription: req.body.shortDescription,
        longDescription: req.body.longDescription,
        rate: req.body.rate,
        expetacions: req.body.expetacions,
        createdAt: new Date().toISOString(),
    }
    const document = db.doc(`/ideas/${req.params.ideaId}`)
    document.update(updatedIdea)
        .then(() => {
            return res.json(updatedIdea);
        })
        .catch(err => {
            return res.status(500).json({ error: err.code })
        })
});

app.get('/categories', (req, res) => {
    db.collection('categories')
        .get()
        .then(data => {
            let categories = [];
            data.forEach(doc => {
                categories.push({
                    categoryId: doc.id,
                })
            })
            return res.status(200).json(categories);
        })
        .catch(err => {
            return res.status(500).json({ error: err.code })
        })
});

app.post('/newCategory', (req, res) => {
    const newCategory = {
        categoryName: req.body.categoryName
    }
    if (newCategory.categoryName.exists) {
        return res.status(404).json({ message: 'Category name already exist' });
    }

    db.collection('categories').doc(`${newCategory.categoryName}`).set({
        'categoryId': newCategory.categoryName
    }, { merge: true })
        .then(() => {
            return res.status(200).json(newCategory)
        })
        .catch(err => {
            return res.status(400).json({ error: err.code })
        })
});

app.delete('/categories/:categoryId', (req, res) => {
    const document = db.doc(`/categories/${req.params.categoryId}`);
    document.delete()
        .then(() => res.status(201).json({ message: 'Category delete successfully' }))
        .catch(err => res.status(500).json({ error: err.code }))
});

exports.api = functions.region('europe-west2').https.onRequest(app);

