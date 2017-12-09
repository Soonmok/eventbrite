const catchErrors = require('../lib/async-error');

module.exports = (app, passport) => {
  app.post('/forget-password', catchErrors(async (req, res, next) => {
    var email = req.body.email;
  }));

  app.post('/reset', catchErrors(async (req, res, next) => {

  }));

  app.get('/signin', (req, res, next) => {
    res.render('signin');
  });

  app.post('/signin', passport.authenticate('local-signin', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signin', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/forget-password', (req, res, next) => {
    res.render('forget-password');
  });

  app.post('/reset-password', catchErrors(async (req, res, next) => {
    res.render('/');
  }));

  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope : 'email' })
  );

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect : '/signin',
      failureFlash : true // allow flash messages
    }), (req, res, next) => {
      req.flash('success', 'Welcome!');
      res.redirect('/');
    }
  );
  app.get('/auth/kakao',
    passport.authenticate('kakao')
  );

  app.get('/auth/kakao/callback',
    passport.authenticate('kakao', {
      failureRedirect : '/signin',
      failureFlash : true // allow flash messages
    }), (req, res, next) => {
      console.log("im in kakao");
      req.flash('success', 'Welcome!');
      res.redirect('/');
    }
  );                                                                                                         

  app.get('/signout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully signed out');
    res.redirect('/');
  });
};
