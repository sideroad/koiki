export default function logger(state = {}, action = {}) {
  console.log(action);
  return state;
}
