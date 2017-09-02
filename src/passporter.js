import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';

const strategies = {
  github: GithubStrategy,
  facebook: FacebookStrategy,
  twitter: TwitterStrategy,
};

const applyStrategy = (authenticator, config, Strategy, origin) => {
  passport.use(new Strategy({
    clientID: config.appId,
    clientSecret: config.secret,
    callbackURL: `${origin}/auth/${authenticator}/callback`
  }, (accessToken, refreshToken, profile, cb) =>
    cb(null, { ...profile, token: accessToken })
  ));
};

const applyEndpoint = (app, authenticator) => {
  app.get(`/auth/${authenticator}`,
    passport.authenticate(authenticator, { session: true }));

  app.get(`/auth/${authenticator}/callback`,
    passport.authenticate(authenticator, { session: true, failureRedirect: `/auth/${authenticator}` }),
    (req, res) => {
      const redirect = req.cookies.redirect || '/';
      res.clearCookie('redirect');
      res.redirect(redirect);
    });
};

export default {

  use: (config, app, origin) => {
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
    const authenticators = Object.keys(config);

    if (!authenticators.length) {
      return;
    }

    // passport setup Strategy
    passport.serializeUser((user, cb) => {
      cb(null, user);
    });

    passport.deserializeUser((obj, cb) => {
      cb(null, obj);
    });

    authenticators.forEach((authenticator) => {
      applyStrategy(authenticator, config[authenticator], strategies[authenticator], origin);
    });

    app.use(passport.initialize());
    app.use(passport.session());

    // Endpoint to confirm authentication is still in valid
    app.get('/auth',
      (req, res, next) => {
        if (req.isAuthenticated()) {
          return next();
        }
        return res.status(401).json({});
      }, (req, res) => {
        res.status(200).json(
          {
            id: req.user.id,
            token: req.user.token
          });
      });

    authenticators.forEach((authenticator) => {
      applyEndpoint(app, authenticator);
    });

  }
};
