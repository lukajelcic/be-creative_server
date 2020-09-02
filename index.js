const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors');
app.use(cors());

const {
    signup,
    login,
    getUser
} = require('./handlers/users');

const {
    getIdeas,
    addIdea,
    getIdea,
    deleteIdea,
    updateIdea
} = require('./handlers/ideas')

const {
    getCategories,
    addCategory,
    deleteCategory
} = require('./handlers/categories');

const FbAuth = require('./utils/fbAuth');
const fbAuth = require('./utils/fbAuth');

//USER ROUTES
app.post('/login', login);
app.post('/signup', signup);
app.get('/user/:username', getUser);

//IDEA ROUTES
app.post('/newIdea', FbAuth, addIdea);
app.get('/ideas', FbAuth, getIdeas);
app.get('/ideas/:ideaId', FbAuth, getIdea);
app.delete('/ideas/:ideaId', FbAuth, deleteIdea);
app.put('/ideas/:ideaId', FbAuth, updateIdea);

//CATEGORY ROUTES
app.get('/categories', getCategories);
app.post('/newCategory', FbAuth, addCategory);
app.delete('/categories/:categoryId', deleteCategory);


exports.api = functions.region('europe-west2').https.onRequest(app);

