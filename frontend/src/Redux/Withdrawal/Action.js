import api from '@/Api/api';
import {
  WITHDRAWAL_REQUEST,
  WITHDRAWAL_SUCCESS,
  WITHDRAWAL_FAILURE,
  WITHDRAWAL_PROCEED_REQUEST,
  WITHDRAWAL_PROCEED_SUCCESS,
  WITHDRAWAL_PROCEED_FAILURE,
  GET_WITHDRAWAL_HISTORY_REQUEST,
  GET_WITHDRAWAL_HISTORY_SUCCESS,
  GET_WITHDRAWAL_HISTORY_FAILURE,
  ADD_PAYMENT_DETAILS_SUCCESS,
  ADD_PAYMENT_DETAILS_REQUEST,
  ADD_PAYMENT_DETAILS_FAILURE,
  GET_PAYMENT_DETAILS_REQUEST,
  GET_PAYMENT_DETAILS_SUCCESS,
  GET_PAYMENT_DETAILS_FAILURE,
  GET_WITHDRAWAL_REQUEST_SUCCESS,
  GET_WITHDRAWAL_REQUEST_FAILURE,
  GET_WITHDRAWAL_REQUEST_REQUEST
} from './ActionTypes';

export const withdrawalRequest = ({ amount }) => async dispatch => {
  dispatch({ type: WITHDRAWAL_REQUEST });
  try {
    const response = await api.post(`/api/withdrawal/${amount}`, null);
    dispatch({ type: WITHDRAWAL_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: WITHDRAWAL_FAILURE, payload: error.message });
  }
};

export const proceedWithdrawal = ({ id, accept }) => async dispatch => {
  dispatch({ type: WITHDRAWAL_PROCEED_REQUEST });
  try {
    const response = await api.patch(`/api/admin/withdrawal/${id}/proceed/${accept}`, null);
    dispatch({ type: WITHDRAWAL_PROCEED_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: WITHDRAWAL_PROCEED_FAILURE, payload: error.message });
  }
};

export const getWithdrawalHistory = () => async dispatch => {
  dispatch({ type: GET_WITHDRAWAL_HISTORY_REQUEST });
  try {
    const response = await api.get('/api/withdrawal');
    dispatch({ type: GET_WITHDRAWAL_HISTORY_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GET_WITHDRAWAL_HISTORY_FAILURE, payload: error.message });
  }
};

export const getAllWithdrawalRequest = () => async dispatch => {
  dispatch({ type: GET_WITHDRAWAL_REQUEST_REQUEST });
  try {
    const response = await api.get('/api/admin/withdrawal');
    dispatch({ type: GET_WITHDRAWAL_REQUEST_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GET_WITHDRAWAL_REQUEST_FAILURE, payload: error.message });
  }
};

export const addPaymentDetails = ({ paymentDetails }) => async dispatch => {
  dispatch({ type: ADD_PAYMENT_DETAILS_REQUEST });
  try {
    const response = await api.post(`/api/payment-details`, paymentDetails);
    dispatch({ type: ADD_PAYMENT_DETAILS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: ADD_PAYMENT_DETAILS_FAILURE, payload: error.message });
  }
};

export const getPaymentDetails = () => async dispatch => {
  dispatch({ type: GET_PAYMENT_DETAILS_REQUEST });
  try {
    const response = await api.get(`/api/payment-details`);
    dispatch({ type: GET_PAYMENT_DETAILS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: GET_PAYMENT_DETAILS_FAILURE, payload: error.message });
  }
};
