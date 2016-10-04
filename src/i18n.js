const SET = 'i18n/SET';

const initialState = {
  msg: {},
  loaded: false
};
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET:
      return {
        ...state,
        msg: action.msg
      };
    default:
      return state;
  }
}

export function set( i18n ) {
  return {
    type: SET,
    msg: i18n.msg
  };
}
