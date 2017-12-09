const catchErrors = require('../lib/async-error');
const User = require('../models/user');


module.exports = (app, passport) => {
  app.post('/forget-password', catchErrors(async (req, res, next) => {
    var _email = req.body.email;
    var nodemailer = require('nodemailer');
    
    const user = await User.findOne({email: _email});
    console.log(user);
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport( {
      host: "smtp.gmail.com", // hostname
      secureConnection: true, // use SSL
      port: 465, // port for secure SMTP
      auth: {
          user: "tnsahr2580@gmail.com",
          pass: process.env.GMAIL_PASSWORD
      }
  });
  
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'tnsahr2580@gmail.com', // sender address
        to: _email, // list of receivers
        subject: 'Change Your Password -MoksBrite', // Subject line
        text: 'asdasd', // plaintext body
        html: `<a href="http://localhost:3000/${user.id}/reset">change your password</a>` // html body
    };
    console.log("this is html");
    console.log(mailOptions.html);
    //send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    res.redirect('/waiting');
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
      req.flash('success', 'Welcome!');
      res.redirect('/');
    }
  );                                                                                                         

  app.get('/signout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully signed out');
    res.redirect('/');
  });

  app.get('/:id/reset', catchErrors(async (req, res, next) => {
    res.render('reset', {user :req.params.id});
  }));
  
  app.post('/:id/reset', catchErrors(async (req, res, next) => {
    const user = await User.findOne({_id: req.params.id});
    user.password = await user.generateHash(req.body.password);
    await user.save();
    req.flash('success', 'Updated successfully.');
    res.redirect('/');
  }));
  
};
