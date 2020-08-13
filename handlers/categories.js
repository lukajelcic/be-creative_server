const { db, admin } = require('../utils/admin');
const config = require('../utils/config');
const firebase = require('firebase');

firebase.initializeApp(config);


//GET CATEGORIES
exports.getCategories = (req, res) => {
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
}

//ADD CATEGORY
exports.addCategory = (req, res) => {
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
}

//DELETE CATEGORY
exports.deleteCategory = (req, res) => {
    const document = db.doc(`/categories/${req.params.categoryId}`);
    document.delete()
        .then(() => res.status(201).json({ message: 'Category delete successfully' }))
        .catch(err => res.status(500).json({ error: err.code }))
}