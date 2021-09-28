import { MutableRefObject } from "react";
import { GenericActions, ListenerState } from "./index";
import { CollectionOptions } from "./types";
import {
  Query,
  onSnapshot,
  DocumentData,
  getDocs,
  QueryDocumentSnapshot,
} from "@firebase/firestore";

const collectionApi = <T>(
  query: Query,
  actions: GenericActions<T>,
  dispatch: Function,
  collectionListenersRef: MutableRefObject<ListenerState[]>,
  lastDocRef?: MutableRefObject<QueryDocumentSnapshot<DocumentData> | null>,
  options?: CollectionOptions
) => {
  dispatch(actions?.loading?.());

  if (options && options?.listen) {
    const listener = onSnapshot(
      query,
      (querySnapshot) => {
        const data: DocumentData[] = [];
        if (querySnapshot.empty) {
          dispatch(actions?.success([]));
          return;
        }
        querySnapshot.forEach((doc) =>
          data.push({ id: doc.id, ...doc.data() })
        );
        dispatch(actions?.success(data as unknown as T[]));
        if (options.lazyLoad) {
          lastDocRef!.current =
            querySnapshot.docs[querySnapshot.docs.length - 1];
        }
      },
      (error) => {
        console.log("collection streaming error", error.message);
        dispatch(actions?.error?.(error.message));
      }
    );
    collectionListenersRef.current.push({
      name: options.listenerName,
      unsubscribe: listener,
    });
  } else {
    getDocs(query)
      .then((querySnapshot) => {
        const data: T[] = [];
        querySnapshot.forEach((doc) =>
          data.push({ id: doc.id, ...doc.data() } as unknown as T)
        );
        dispatch(actions?.success(data as unknown as T[]));
        if (options && options.lazyLoad) {
          lastDocRef!.current =
            querySnapshot.docs[querySnapshot.docs.length - 1];
        }
      })
      .catch((error) => {
        console.log("collection get error", error.message);
        dispatch(actions?.error?.(error.message));
      });
  }
};

export default collectionApi;
