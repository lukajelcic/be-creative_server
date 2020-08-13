const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
app.use(cors());

const {
    getIdeas,
    addIdea,
    getIdea,
    deleteIdea,
    updateIdea
} = require('./handlers/ideas')

const { getCategories, addCategory, deleteCategory } = require('./handlers/categories')

//IDEA ROUTES
app.post('/newIdea', addIdea);
app.get('/ideas', getIdeas);
app.get('/ideas/:ideaId', getIdea);
app.delete('/ideas/:ideaId', deleteIdea);
app.put('/ideas/:ideaId', updateIdea);

//CATEGORY ROUTES
app.get('/categories', getCategories);
app.post('/newCategory', addCategory);
app.delete('/categories/:categoryId');

exports.api = functions.region('europe-west2').https.onRequest(app);

