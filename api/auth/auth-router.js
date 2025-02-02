
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Users = require('./auth-model');
const registerPayload = require('../middleware/registerPayload');
const loginPayload = require('../middleware/loginPayload');
const checkUsernameExists = require('../middleware/checkUsernameExists');
const loginValidation = require('../middleware/loginValidation');

router.post('/register', registerPayload, async (req, res, next) => {
  try {
    let user = req.body;
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcrypt.hashSync(user.password, rounds);
    user.password = hash;
    const newUser = await Users.addUser(user);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginPayload, checkUsernameExists, loginValidation, (req, res) => {
  const { user, token } = req;
  res.json({ message: `welcome, ${user.username}`, token });
});

module.exports = router;



// const router = require('express').Router();

// router.post('/register', (req, res) => {
//   res.end('implement register, please!');
//   /*
//     IMPLEMENT
//     You are welcome to build additional middlewares to help with the endpoint's functionality.
//     DO NOT EXCEED 2^8 ROUNDS OF HASHING!

//     1- In order to register a new account the client must provide `username` and `password`:
//       {
//         "username": "Captain Marvel", // must not exist already in the `users` table
//         "password": "foobar"          // needs to be hashed before it's saved
//       }

//     2- On SUCCESSFUL registration,
//       the response body should have `id`, `username` and `password`:
//       {
//         "id": 1,
//         "username": "Captain Marvel",
//         "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
//       }

//     3- On FAILED registration due to `username` or `password` missing from the request body,
//       the response body should include a string exactly as follows: "username and password required".

//     4- On FAILED registration due to the `username` being taken,
//       the response body should include a string exactly as follows: "username taken".
//   */
// });

// router.post('/login', (req, res) => {
//   res.end('implement login, please!');
//   /*
//     IMPLEMENT
//     You are welcome to build additional middlewares to help with the endpoint's functionality.

//     1- In order to log into an existing account the client must provide `username` and `password`:
//       {
//         "username": "Captain Marvel",
//         "password": "foobar"
//       }

//     2- On SUCCESSFUL login,
//       the response body should have `message` and `token`:
//       {
//         "message": "welcome, Captain Marvel",
//         "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
//       }

//     3- On FAILED login due to `username` or `password` missing from the request body,
//       the response body should include a string exactly as follows: "username and password required".

//     4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
//       the response body should include a string exactly as follows: "invalid credentials".
//   */
// });

// module.exports = router;
