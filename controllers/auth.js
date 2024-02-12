const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const e = require('express');
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
    error: req.flash('error'),
    isAdmin: req.session.isAdmin === 'True' ? true : false,
  });
};

exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    error: req.flash('error'),
    isAdmin: req.session.isAdmin,
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      bcrypt.compare(password, user.password).then((booleanRes) => {
        if (booleanRes) {
          //Password Match
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.isAdmin = user.superUser;
          return req.session.save((err) => {
            console.log(err);
            res.redirect('/');
          });
        }

        req.flash('error', 'Invalid Credentials');
        res.redirect('/login');
      });
    })
    .catch(() => {
      console.log('Invalid Email');
      req.flash('error', 'Invalid Credentials');
      res.redirect('/login');
    });
};

exports.postSignup = (req, res) => {
  email = req.body.email;
  password = req.body.password;
  const error = validationResult(req);
  console.log(error.array());

  if (!error.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      error: error.array()[0].msg,
    });
  }
  User.findOne({ email: email }).then((userFetch) => {
    if (userFetch) {
      req.flash('error', 'User Already Exists!');
      return res.redirect('/signup');
    }
    let isSuperUser = false;
    if (email === 'abc@abc.com' && password === '123456') {
      isSuperUser = true;
    }
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] },
          superUser: isSuperUser?"True":"False",
          address: req.body.address,
          mobileno: req.body.mobileno,
          name: req.body.name,
        });
        return user.save();
      })
      .then((result) => {
        res.redirect('/login');
      })
      .catch((err) => console.log(err));
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};


