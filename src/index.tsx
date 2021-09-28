import { useEffect, useRef, createContext } from "react";
import collectionApi from "./collectionApi";
import docApi from "./docApi";
import { leftJoinApi } from "./leftJoinApi";
import { CollectionOptions, DocumentOptions } from "./types";
import {
  ActionCreatorWithOptionalPayload,
  ActionCreatorWithoutPayload,
} from "@reduxjs/toolkit";
import {
  DocumentData,
  QueryDocumentSnapshot,
  Firestore,
  startAfter,
  query,
  collection as c,
  doc as d,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  UpdateData,
  WithFieldValue,
} from "@firebase/firestore";
import { buildQuery } from "./buildQuery";
import { useContext } from "hoist-non-react-statics/node_modules/@types/react";

export const FirestoreContext = createContext<{
  db: Firestore | null;
  dispatch: Function;
}>({ db: null, dispatch: () => {} });
export const FirestoreProvider = FirestoreContext.Provider;

export interface ListenerState {
  name?: string;
  unsubscribe: () => void;
}

export type GenericActions<T> = {
  loading?: ActionCreatorWithoutPayload<string>;
  success: ActionCreatorWithOptionalPayload<T | T[], string>;
  error?: ActionCreatorWithOptionalPayload<any, string>;
};

export const useFirestore = <T extends DocumentData>(path: string) => {
  const db = useContext(FirestoreContext).db!;

  const collectionListenersRef = useRef<ListenerState[]>([]);
  const docListenersRef = useRef<ListenerState[]>([]);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData>>(null);

  useEffect(() => {
    return () => {
      collectionListenersRef.current?.forEach((listener) => {
        listener.unsubscribe();
      });
      docListenersRef.current.forEach((listener) => {
        listener.unsubscribe();
      });
    };
  }, [collectionListenersRef]);

  const dispatch = useContext(FirestoreContext).dispatch;

  const collection = (
    actions: GenericActions<T>,
    options?: CollectionOptions
  ): void | {} => {
    let collectionQuery = buildQuery(db, path, options);

    collectionApi<T>(
      collectionQuery,
      actions,
      dispatch,
      collectionListenersRef,
      lastDocRef,
      options
    );

    if (options?.lazyLoad) {
      return {
        loadMore: (limit?: number) => {
          if (limit) {
            collectionQuery = buildQuery(db, path, { ...options, limit });
          }

          collectionQuery = query(
            collectionQuery,
            startAfter(lastDocRef.current)
          );

          collectionApi<T>(
            collectionQuery,
            actions,
            dispatch,
            collectionListenersRef,
            lastDocRef,
            options
          );
        },
      };
    }
  };

  const doc = async (
    id: string,
    actions: GenericActions<T>,
    options?: DocumentOptions
  ) => {
    console.log("path: ", path);
    docApi<T>(db, path, id, actions, dispatch, docListenersRef, options);
  };

  const leftJoin = async <T,>(
    pathOne: string,
    pathTwo: string,
    joinKey: string,
    field: string,
    actions: GenericActions<T>,
    options?: CollectionOptions
  ) => {
    leftJoinApi<T>(
      db,
      pathOne,
      pathTwo,
      joinKey,
      field,
      actions,
      dispatch,
      collectionListenersRef,
      options
    );
  };

  const id = () => {
    const ref = c(db, path);
    return ref.id;
  };

  const add = async (data: T) => {
    const ref = c(db, path);

    return addDoc(ref, data)
      .then((res) => {
        console.log("Document created with id: ", res.id);
        return res.id;
      })
      .catch((e) => console.log("Error creating document", e));
  };

  const update = async (id: string, data: UpdateData<Partial<T>>) => {
    const docRef = d(db, path, id);
    return updateDoc(docRef, data)
      .then(() => console.log("Document updated."))
      .catch((e) => {
        console.log(`Error updating document with id: ${id}`, e);
        return Promise.reject(e);
      });
  };

  const set = async (id: string, data: WithFieldValue<Partial<T>>) => {
    const docRef = d(db, path, id);
    return setDoc(docRef, data)
      .then(() => console.log("Document updated."))
      .catch((e) => {
        console.log(`Error updating document with id: ${id}`, e);
        throw e;
      });
  };

  const remove = async (id: string) => {
    const docRef = d(db, path, id);
    return deleteDoc(docRef)
      .then(() => console.log("Document deleted."))
      .catch((e) => {
        throw e;
      });
  };

  const unsubscribe = (listenerName?: string) => {
    if (listenerName) {
      collectionListenersRef.current
        .find((listener) => listener.name === listenerName)
        ?.unsubscribe();
      docListenersRef.current
        .find((listener) => listener.name === listenerName)
        ?.unsubscribe();
      return;
    }
    collectionListenersRef.current.forEach((listener) =>
      listener.unsubscribe()
    );
    docListenersRef.current.forEach((listener) => listener.unsubscribe());
  };

  return {
    collection,
    doc,
    leftJoin,
    id,
    add,
    update,
    set,
    remove,
    unsubscribe,
  };
};
