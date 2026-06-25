/* eslint-disable no-unused-vars */
import api from "@/Api/api";
import {
  CHAT_BOT_FAILURE,
  CHAT_BOT_REQUEST,
  CHAT_BOT_SUCCESS,
} from "./ActionTypes";

export const sendMessage = ({ prompt }) => async (dispatch) => {
  dispatch({
    type: CHAT_BOT_REQUEST,
    payload: { prompt, role: "user" },
  });

  try {
    const { data } = await api.post("/chat/bot/coin", { prompt });
    dispatch({
      type: CHAT_BOT_SUCCESS,
      payload: { ans: data.message, role: "model" },
    });
  } catch (error) {
    dispatch({ type: CHAT_BOT_FAILURE, payload: error });
  }
};
