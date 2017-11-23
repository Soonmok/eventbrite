const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const KakaoTalkStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>  {
    User.findById(id, done);
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({email: email});
      if (user && await user.validatePassword(password)) {
        return done(null, user, req.flash('success', 'Welcome!'));
      }
      return done(null, false, req.flash('danger', 'Invalid email or password'));
    } catch(err) {
      done(err);
    }
  }));

  passport.use(new FacebookStrategy({
    // 이 부분을 여러분 Facebook App의 정보로 수정해야 합니다.
    clientID : '160045798074805',
    clientSecret : '124d62ba59e52955a2100dace3e50597',
    callbackURL : 'http://localhost:3000/auth/facebook/callback',
    profileFields : ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    console.log('Facebook', profile); // profile 정보로 뭐가 넘어오나 보자.
    try {
      
      var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(email, picture, name, profile.name);
      // 같은 facebook id를 가진 사용자가 있나?
      var user = await User.findOne({'facebook.id': profile.id});
      console.log("123123123123123")
      if (!user) {
        // 없다면, 혹시 같은 email이라도 가진 사용자가 있나?
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          // 그것도 없다면 새로 만들어야지.
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
        }
        // facebook id가 없는 사용자는 해당 id를 등록
        user.facebook.id = profile.id;
        user.facebook.photo = picture;
      }
      console.log("123123123123123")
      user.facebook.token = profile.token;
      await user.save();
      console.log("123123123123123")
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.use(new KakaoTalkStrategy({
    // 이 부분을 여러분 Kakao App의 정보로 수정해야 합니다.
    clientID : '68efdd40d232475e75839be8d295bebc',
    clientSecret : '4ZLAoOxirQJ98gEtoffqi5qjTHD5ndQY',
    callbackURL : 'http://localhost:3000/auth/kakao/callback',
    profileFields : ['email', 'name', 'picture']
  }, async (token, refreshToken, profile, done) => {
    console.log('Kakao', profile); // profile 정보로 뭐가 넘어오나 보자.
    try {
      var email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : '';
      var picture = (profile.photos && profile.photos[0]) ? profile.photos[0].value : '';
      var name = (profile.displayName) ? profile.displayName : 
        [profile.name.givenName, profile.name.middleName, profile.name.familyName]
          .filter(e => e).join(' ');
      console.log(email, picture, name, profile.name);
      // 같은 kakao id를 가진 사용자가 있나?
      var user = await User.findOne({'kakao.id': profile.id});
      if (!user) {
        // 없다면, 혹시 같은 email이라도 가진 사용자가 있나?
        if (email) {
          user = await User.findOne({email: email});
        }
        if (!user) {
          // 그것도 없다면 새로 만들어야지.
          user = new User({name: name});
          user.email =  email ? email : `__unknown-${user._id}@no-email.com`;
        }
        // kakao id가 없는 사용자는 해당 id를 등록
        user.kakao.id = profile.id;
        user.kakao.photo = picture;
      }
      user.kakao.token = profile.token;
      await user.save();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  }));
};
