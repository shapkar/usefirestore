import {
  createGenericEntityAdapter,
  createGenericEntitySlice,
} from "./entitySlice";
import { RootState } from "../store/store";

export interface Notification {
  id?: string;
  message: string;
  date: string;
}

const entityAdapter = createGenericEntityAdapter(
  (notification: Notification) => notification.id
);

export const slice = createGenericEntitySlice({
  name: "notification",
  entityAdapter,
  initialState: entityAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
});

export const selector = entityAdapter.getSelectors<RootState>(
  (state) => state.notifications
);

export const reducer = slice.reducer;
