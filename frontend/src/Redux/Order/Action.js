import api from '@/Api/api';
import * as types from './ActionTypes';

export const payOrder = ({ orderData, amount }) => async (dispatch) => {
  dispatch({ type: types.PAY_ORDER_REQUEST });
  try {
    const response = await api.post('/api/orders/pay', orderData);
    dispatch({ type: types.PAY_ORDER_SUCCESS, payload: response.data, amount });
  } catch (error) {
    dispatch({ type: types.PAY_ORDER_FAILURE, error: error.message });
  }
};

export const getOrderById = (orderId) => async (dispatch) => {
  dispatch({ type: types.GET_ORDER_REQUEST });
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    dispatch({ type: types.GET_ORDER_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_ORDER_FAILURE, error: error.message });
  }
};

export const getAllOrdersForUser = ({ orderType, assetSymbol } = {}) => async (dispatch) => {
  dispatch({ type: types.GET_ALL_ORDERS_REQUEST });
  try {
    const response = await api.get('/api/orders', {
      params: {
        order_type: orderType,
        asset_symbol: assetSymbol,
      },
    });
    dispatch({ type: types.GET_ALL_ORDERS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: types.GET_ALL_ORDERS_FAILURE, error: error.message });
  }
};
