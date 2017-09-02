
const get = (url, cookie) => {
  return fetch(`${url}`, {
    credentials: 'include',
    headers: {
      cookie: `connect.sid=${cookie.get('connect.sid')}`
    }
  })
    .then(
      (res) => {
        if (res.ok) {
          return res.json();
        }
        return Promise((resolve, reject) =>
          reject('User does not logged in yet')
        );
      }
    );
};

const check = (store, cookie, origin = 'http://localhost:3000', setUser) => {
  return (nextState, replace, cb) => {
    const isLogin = store.getState().user &&
                     store.getState().user.item &&
                     store.getState().user.item.id;
    if (isLogin) {
      cb();
    } else {
      get(`${origin}/auth`, cookie)
         .then(
           // login user
           (res) => {
             store.dispatch(setUser({
               id: res.id,
               token: res.token
             }));
             cb();
           },
           () => {
             cb();
           }
         );
    }
  };
};

const login = (store, cookie, origin = 'http://localhost:3000', authenticator, setUser) => {
  const connectedCheck = check(store, cookie, origin, setUser);
  return (nextState, replace, cb) => {
    connectedCheck(nextState, replace, () => {
      const isLogin = store.getState().user &&
                      store.getState().user.item &&
                      store.getState().user.item.id;
      if (isLogin) {
        cb();
      } else {
        cookie.set('redirect', nextState.location.pathname, {
          path: '/'
        });
        if (__SERVER__) {
          replace(`/auth/${authenticator}`);
          cb();
        } else {
          location.href = `${origin}/auth/${authenticator}`;
        }
      }
    });
  };
};

export default {
  check,
  login
};
