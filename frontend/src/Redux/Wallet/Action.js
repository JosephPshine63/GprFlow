import api from "@/Api/api";
import { apiErrorMessage } from "@/Util/apiError";
import * as types from "./ActionTypes";

export const getUserWallet = () => async (dispatch) => {
  dispatch({ type: types.GET_USER_WALLET_REQUEST });
  try {
    const response = await api.get("/api/wallet");
    dispatch({ type: types.GET_USER_WALLET_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_USER_WALLET_FAILURE, error: error.message });
  }
};

export const getWalletTransactions = () => async (dispatch) => {
  dispatch({ type: types.GET_WALLET_TRANSACTION_REQUEST });
  try {
    const response = await api.get("/api/wallet/transactions");
    dispatch({ type: types.GET_WALLET_TRANSACTION_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_WALLET_TRANSACTION_FAILURE, error: error.message });
  }
};

export const depositMoney =
  ({ orderId, paymentId, navigate }) =>
  async (dispatch) => {
    dispatch({ type: types.DEPOSIT_MONEY_REQUEST });
    try {
      const response = await api.put(`/api/wallet/deposit`, null, {
        params: {
          order_id: orderId,
          payment_id: paymentId,
        },
      });
      dispatch({ type: types.DEPOSIT_MONEY_SUCCESS, payload: response.data });
      navigate("/payment/success", { replace: true });
      return response.data;
    } catch (error) {
      const message = apiErrorMessage(error);
      dispatch({ type: types.DEPOSIT_MONEY_FAILURE, error: message });
      throw new Error(message);
    }
  };

export const paymentHandler =
  ({ amount, paymentMethod }) =>
  async (dispatch) => {
    dispatch({ type: types.DEPOSIT_MONEY_REQUEST });
    try {
      const response = await api.post(
        `/api/payment/${paymentMethod}/amount/${amount}`,
        null
      );
      // the page leaves for the payment provider; the reducer must not take
      // the payment link as a wallet
      window.location.href = response.data.payment_url;
      return response.data;
    } catch (error) {
      const message = apiErrorMessage(error);
      dispatch({ type: types.DEPOSIT_MONEY_FAILURE, error: message });
      throw new Error(message);
    }
  };

export const transferMoney =
  ({ walletId, reqData }) =>
  async (dispatch) => {
    dispatch({ type: types.TRANSFER_MONEY_REQUEST });
    try {
      const response = await api.put(
        `/api/wallet/${walletId}/transfer`,
        reqData
      );
      dispatch({ type: types.TRANSFER_MONEY_SUCCESS, payload: response.data });
      return response.data;
    } catch (error) {
      const message = apiErrorMessage(error);
      dispatch({ type: types.TRANSFER_MONEY_FAILURE, error: message });
      throw new Error(message);
    }
  };
