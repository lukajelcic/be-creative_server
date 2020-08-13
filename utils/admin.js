const admin = require('firebase-admin');

var serviceAccount = require("../be-creative-dd183-firebase-adminsdk-r0bfa-2542e2a2f6.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://be-creative-dd183.firebaseio.com"
});


const db = admin.firestore();

module.exports = { admin, db };