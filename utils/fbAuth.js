const { admin, db } = require('./admin');


module.exports = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.log('Token not found');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    admin.auth().verifyIdToken(token)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            req.user.username = data.docs[0].data().username;
            return next();
        })
        .catch(err => {
            console.error(err);
            return res.status(403).json({ error: 'Error while verifying token' })
        })
}