import api from "@/Api/api";
import * as types from "./ActionTypes";

export const getAssetById = ({ assetId }) => async (dispatch) => {
  dispatch({ type: types.GET_ASSET_REQUEST });
  try {
    const response = await api.get(`/api/assets/${assetId}`);
    dispatch({ type: types.GET_ASSET_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_ASSET_FAILURE, error: error.message });
  }
};

export const getAssetDetails = ({ coinId }) => async (dispatch) => {
  dispatch({ type: types.GET_ASSET_DETAILS_REQUEST });
  try {
    const response = await api.get(`/api/assets/coin/${coinId}/user`);
    dispatch({ type: types.GET_ASSET_DETAILS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_ASSET_FAILURE, error: error.message });
  }
};

export const getUserAssets = () => async (dispatch) => {
  dispatch({ type: types.GET_USER_ASSETS_REQUEST });
  try {
    const response = await api.get("/api/assets");
    dispatch({ type: types.GET_USER_ASSETS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_USER_ASSETS_FAILURE, error: error.message });
  }
};
