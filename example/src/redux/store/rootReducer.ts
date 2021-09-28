import { combineReducers } from "@reduxjs/toolkit";
import { reducer as notificationReducer } from "../slices/notification";

const rootReducer = combineReducers({
  notifications: notificationReducer,
});

export default rootReducer;
