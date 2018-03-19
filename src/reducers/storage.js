export default function(state = { loaded: false }, action) {
  switch (action.type) {
    case "persist/REHYDRATE":
      return { loaded: true };
  }
  return state;
}
