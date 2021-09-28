import {
  createEntityAdapter,
  createSlice,
  EntityAdapter,
  EntityState,
  PayloadAction,
  SliceCaseReducers,
  ValidateSliceCaseReducers,
} from "@reduxjs/toolkit";

export interface GenericEntityState<T> extends EntityState<T> {
  loading: boolean;
  error: any;
  done?: boolean;
}

export const createGenericEntityAdapter = <T>(
  selectId?: (entity: T) => string
) => {
  return createEntityAdapter<T>({
    selectId,
  });
};

export const createGenericEntitySlice = <
  T extends { id?: string },
  State extends GenericEntityState<T>,
  Reducers extends SliceCaseReducers<State>
>({
  entityAdapter,
  name = "",
  initialState,
  reducers,
}: {
  entityAdapter: EntityAdapter<T>;
  name: string;
  initialState?: State;
  reducers: ValidateSliceCaseReducers<State, Reducers>;
}) => {
  return createSlice({
    name,
    initialState,
    reducers: {
      loading(state) {
        state.loading = true;
      },
      error(state: GenericEntityState<T>, action: PayloadAction<any>) {
        state.error = action.payload;
        state.loading = false;
      },
      setAll(state: GenericEntityState<T>, action: PayloadAction<T | T[]>) {
        const payload = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];

        entityAdapter.setAll(state, payload);
        state.loading = false;

        if (!payload.length) {
          state.done = true;
        }
      },
      addOne(state: GenericEntityState<T>, action: PayloadAction<T>) {
        entityAdapter.addOne(state, action.payload);
        state.loading = false;
      },
      updateOne(
        state: GenericEntityState<T>,
        action: PayloadAction<Partial<T>>
      ) {
        entityAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.loading = false;
      },
      removeOne(state: GenericEntityState<T>, action: PayloadAction<string>) {
        entityAdapter.removeOne(state, action.payload);
      },
      upsertOne(state: GenericEntityState<T>, action: PayloadAction<T>) {
        entityAdapter.upsertOne(state, action.payload);
        state.loading = false;
      },
      upsertMany(state: GenericEntityState<T>, action: PayloadAction<T[]>) {
        entityAdapter.upsertMany(state, action.payload);
        if (!action.payload.length) {
          state.done = true;
        }
        state.loading = false;
      },
      deleteOne(state: GenericEntityState<T>, action: PayloadAction<string>) {
        entityAdapter.removeOne(state, action.payload);
        state.loading = false;
      },
      ...reducers,
    },
  });
};
