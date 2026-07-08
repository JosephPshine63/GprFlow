import * as actionTypes from "./ActionTypes";
import api from "@/Api/api";

export const register = (userData) => async (dispatch) => {
  dispatch({ type: actionTypes.REGISTER_REQUEST });
  try {
    await api.post(`/auth/signup`, userData);
    await dispatch(getUser());
    userData.navigate("/");
    dispatch({ type: actionTypes.REGISTER_SUCCESS });
  } catch (error) {
    dispatch({
      type: actionTypes.REGISTER_FAILURE,
      payload: error.response?.data ?? error,
    });
  }
};

export const login = (userData) => async (dispatch) => {
  dispatch({ type: actionTypes.LOGIN_REQUEST });
  try {
    const response = await api.post(`/auth/signin`, userData);
    const user = response.data;
    if (user.twoFactorAuthEnabled) {
      userData.navigate(`/two-factor-auth/${user.session}`);
      dispatch({ type: actionTypes.LOGIN_SUCCESS });
      return;
    }
    await dispatch(getUser());
    userData.navigate("/");
    dispatch({ type: actionTypes.LOGIN_SUCCESS });
  } catch (error) {
    dispatch({
      type: actionTypes.LOGIN_FAILURE,
      payload: error.response?.data ?? error,
    });
  }
};

export const twoStepVerification =
  ({ otp, session, navigate }) =>
  async (dispatch) => {
    dispatch({ type: actionTypes.LOGIN_TWO_STEP_REQUEST });
    try {
      await api.post(
        `/auth/two-factor/otp/${otp}`,
        {},
        { params: { id: session } }
      );
      await dispatch(getUser());
      navigate("/");
      dispatch({ type: actionTypes.LOGIN_TWO_STEP_SUCCESS });
    } catch (error) {
      dispatch({
        type: actionTypes.LOGIN_TWO_STEP_FAILURE,
        payload: error.response?.data ?? error,
      });
    }
  };

export const getUser = () => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.GET_USER_REQUEST });
    try {
      const response = await api.get(`/api/users/profile`);
      dispatch({ type: actionTypes.GET_USER_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: actionTypes.GET_USER_FAILURE, payload: null });
    }
  };
};

export const sendVerificationOtp = ({ verificationType }) => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.SEND_VERIFICATION_OTP_REQUEST });
    try {
      const response = await api.post(
        `/api/users/verification/${verificationType}/send-otp`
      );
      dispatch({
        type: actionTypes.SEND_VERIFICATION_OTP_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: actionTypes.SEND_VERIFICATION_OTP_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const verifyOtp = ({ otp }) => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.VERIFY_OTP_REQUEST });
    try {
      const response = await api.patch(
        `/api/users/verification/verify-otp/${otp}`
      );
      dispatch({ type: actionTypes.VERIFY_OTP_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: actionTypes.VERIFY_OTP_FAILURE, payload: error.message });
    }
  };
};

export const enableTwoStepAuthentication = ({ otp }) => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.ENABLE_TWO_STEP_AUTHENTICATION_REQUEST });
    try {
      const response = await api.patch(
        `/api/users/enable-two-factor/verify-otp/${otp}`
      );
      dispatch({
        type: actionTypes.ENABLE_TWO_STEP_AUTHENTICATION_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: actionTypes.ENABLE_TWO_STEP_AUTHENTICATION_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const sendResetPassowrdOTP = ({ sendTo, verificationType, navigate }) => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.SEND_RESET_PASSWORD_OTP_REQUEST });
    try {
      const response = await api.post(
        `/auth/users/reset-password/send-otp`,
        { sendTo, verificationType }
      );
      const user = response.data;
      navigate(`/reset-password/${user.session}`);
      dispatch({
        type: actionTypes.SEND_RESET_PASSWORD_OTP_SUCCESS,
        payload: user,
      });
    } catch (error) {
      dispatch({
        type: actionTypes.SEND_RESET_PASSWORD_OTP_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const verifyResetPassowrdOTP = ({ otp, password, session, navigate }) => {
  return async (dispatch) => {
    dispatch({ type: actionTypes.VERIFY_RESET_PASSWORD_OTP_REQUEST });
    try {
      const response = await api.patch(
        `/auth/users/reset-password/verify-otp`,
        { otp, password },
        { params: { id: session } }
      );
      dispatch({
        type: actionTypes.VERIFY_RESET_PASSWORD_OTP_SUCCESS,
        payload: response.data,
      });
      navigate("/password-update-successfully");
    } catch (error) {
      dispatch({
        type: actionTypes.VERIFY_RESET_PASSWORD_OTP_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    try {
      await api.post(`/auth/logout`);
    } catch (_) {
      // ignore network errors on logout
    }
    dispatch({ type: actionTypes.LOGOUT });
  };
};
