import api from "@/Api/api";
import * as types from "./ActionTypes";

export const getStats = (period) => async (dispatch) => {
  dispatch({ type: types.GET_STATS_REQUEST, period });
  try {
    const response = await api.get("/api/wallet/stats", { params: { period } });
    dispatch({ type: types.GET_STATS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_STATS_FAILURE, error: error.message });
  }
};
