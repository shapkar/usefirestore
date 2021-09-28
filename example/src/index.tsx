import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { FirestoreProvider } from "../../dist";
import { db } from "./config";
import { useDispatch } from "./redux/store/store";

ReactDOM.render(
  <FirestoreProvider value={{ db, dispatch: useDispatch }}>
    <App />
  </FirestoreProvider>,
  document.getElementById("root")
);
