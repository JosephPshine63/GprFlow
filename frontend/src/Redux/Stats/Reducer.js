import * as types from "./ActionTypes";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const statsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_STATS_REQUEST:
      return { ...state, loading: true, error: null };
    case types.GET_STATS_SUCCESS:
      return { ...state, data: action.payload, loading: false, error: null };
    case types.GET_STATS_FAILURE:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export default statsReducer;
