import { FETCH_COIN_BY_ID_FAILURE, FETCH_COIN_BY_ID_REQUEST, FETCH_COIN_BY_ID_SUCCESS, FETCH_COIN_DETAILS_FAILURE, FETCH_COIN_DETAILS_REQUEST, FETCH_COIN_DETAILS_SUCCESS, FETCH_COIN_LIST_FAILURE, FETCH_COIN_LIST_REQUEST, FETCH_COIN_LIST_SUCCESS, FETCH_MARKET_CHART_FAILURE, FETCH_MARKET_CHART_REQUEST, FETCH_MARKET_CHART_SUCCESS, FETCH_TOP_50_COINS_FAILURE, FETCH_TOP_50_COINS_REQUEST, FETCH_TOP_50_COINS_SUCCESS, FETCH_TRADING_COINS_FAILURE, FETCH_TRADING_COINS_REQUEST, FETCH_TRADING_COINS_SUCCESS, SEARCH_COIN_FAILURE, SEARCH_COIN_REQUEST, SEARCH_COIN_SUCCESS } from "./ActionTypes";
import api from "@/Api/api";

export const fetchCoinList = (page) => async (dispatch) => {
    dispatch({ type: FETCH_COIN_LIST_REQUEST });
    try {
      const response = await api.get(`/api/coins?page=${page}`);
      dispatch({ type: FETCH_COIN_LIST_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_COIN_LIST_FAILURE, payload: error.message });
    }
  };

  export const getTop50CoinList = () => async (dispatch) => {
    dispatch({ type: FETCH_TOP_50_COINS_REQUEST });
    try {
      const response = await api.get(`/api/coins/top50`);
      dispatch({ type: FETCH_TOP_50_COINS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_TOP_50_COINS_FAILURE, payload: error.message });
    }
  };

  export const fetchTreadingCoinList = () => async (dispatch) => {
    dispatch({ type: FETCH_TRADING_COINS_REQUEST });
    try {
      const response = await api.get(`/api/coins/trading`);
      dispatch({ type: FETCH_TRADING_COINS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_TRADING_COINS_FAILURE, payload: error.message });
    }
  };

  export const fetchMarketChart = ({coinId, days}) => async (dispatch) => {
    dispatch({ type: FETCH_MARKET_CHART_REQUEST });
    try {
      const response = await api.get(`/api/coins/${coinId}/chart?days=${days}`);
      dispatch({ type: FETCH_MARKET_CHART_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_MARKET_CHART_FAILURE, payload: error.message });
    }
  };

  export const fetchCoinById = (coinId) => async (dispatch) => {
    dispatch({ type: FETCH_COIN_BY_ID_REQUEST });
    try {
      const response = await api.get(`/api/coins/${coinId}`);
      dispatch({ type: FETCH_COIN_BY_ID_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_COIN_BY_ID_FAILURE, payload: error.message });
    }
  };

  export const fetchCoinDetails = ({coinId}) => async (dispatch) => {
    dispatch({ type: FETCH_COIN_DETAILS_REQUEST });
    try {
      const response = await api.get(`/api/coins/details/${coinId}`);
      dispatch({ type: FETCH_COIN_DETAILS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: FETCH_COIN_DETAILS_FAILURE, payload: error.message });
    }
  };

  export const searchCoin = (keyword) => async (dispatch) => {
    dispatch({ type: SEARCH_COIN_REQUEST });
    try {
      const response = await api.get(`/api/coins/search?q=${keyword}`);
      dispatch({ type: SEARCH_COIN_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: SEARCH_COIN_FAILURE, payload: error.message });
    }
  };
