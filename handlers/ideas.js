const { db } = require('../utils/admin');

//GET IDEAS
exports.getIdeas = (req, res) => {
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
}

//ADD IDEA
exports.addIdea = (req, res) => {
    const newIdea = {
        username: req.user.username,
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
                .doc(`${newIdea.ideaId}`).set(newIdea, { merge: true });
        })
        .catch(err => {
            res.status(500).json({ message: `Something went wrong` })
            console.log(err)
        })
}

//GET IDEA
exports.getIdea = (req, res) => {
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
}

//DELETE IDEA
exports.deleteIdea = (req, res) => {
    const document = db.doc(`/ideas/${req.params.ideaId}`);

    document.delete()
        .then(() => {
            res.status(200).json({ message: 'Idea delete successfully' })
        })
        .then(() => {
            //Get category name to delete doc
            return db.collection('categories').doc('work').collection('ideas')
                .where('ideaId', '==', `${req.params.ideaId}`)
                .onSnapshot((snapshot) => {
                    snapshot.forEach(result => result.ref.delete())
                })
        })
        .catch(err => res.status(400).json({ error: err.code }));
}

//UPDATE IDEA
exports.updateIdea = (req, res) => {
    const updatedIdea = {
        num: req.body.num,
        shortDescription: req.body.shortDescription,
        longDescription: req.body.longDescription,
        rate: req.body.rate,
        expetacions: req.body.expetacions,
        createdAt: new Date().toISOString(),
    }
    if (updatedIdea == null) return res.status(404).json({ error: 'Idea not found' })
    const document = db.doc(`/ideas/${req.params.ideaId}`)
    document.update(updatedIdea)
        .then(() => {
            return res.json(updatedIdea);
        })
        .catch(err => {
            return res.status(500).json({ error: err.code })
        })
}