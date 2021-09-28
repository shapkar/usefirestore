import { GenericActions, ListenerState } from "./index";
import { CollectionOptions } from "./types";
import {
  Firestore,
  getDocs,
  doc as d,
  getDoc,
  onSnapshot,
} from "@firebase/firestore";
import { buildQuery } from "./buildQuery";
import { MutableRefObject } from "hoist-non-react-statics/node_modules/@types/react";

export const leftJoinApi = async <T>(
  db: Firestore,
  pathOne: string,
  pathTwo: string,
  joinKey: string,
  field: string,
  actions: GenericActions<T>,
  dispatch: Function,
  collectionListenersRef: MutableRefObject<ListenerState[]>,
  options?: CollectionOptions
) => {
  const query = buildQuery(db, pathOne, options);

  dispatch(actions.loading);
  if (options && options?.listen) {
    const listener = onSnapshot(
      query,
      async (querySnapshot) => {
        if (querySnapshot.empty) {
          dispatch([]);
          return;
        }

        const joinedArray: T[] = [];

        for (const doc of querySnapshot.docs) {
          const data = { id: doc.id, ...doc.data() };
          const joiningId = data[joinKey];

          const docToBeJoinedRef = d(db, pathTwo, joiningId);
          const docToBeJoinedSnap = await getDoc(docToBeJoinedRef);

          const dataToBeJoined = {
            id: docToBeJoinedRef.id,
            ...docToBeJoinedSnap.data(),
          };

          const joinedData = {
            ...data,
            [field]: dataToBeJoined,
          } as unknown as T;

          joinedArray.push(joinedData);
        }

        dispatch(actions.success(joinedArray));
        // if (options.lazyLoad) {
        //     lastDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
        // }
      },
      (error) => {
        console.log("error joining from left on Snapshot", error.message);
        dispatch(actions?.error?.(error.message));
      }
    );

    collectionListenersRef.current.push({
      name: options.listenerName,
      unsubscribe: listener,
    });
  } else {
    getDocs(query)
      .then(async (snap) => {
        if (snap.empty) dispatch([]);

        const joinedArray: T[] = [];

        for (const doc of snap.docs) {
          const data = doc.data();
          const joiningId = data[joinKey];

          const docToBeJoinedRef = d(db, pathTwo, joiningId);
          const docToBeJoinedSnap = await getDoc(docToBeJoinedRef);

          const dataToBeJoined = {
            id: docToBeJoinedRef.id,
            ...docToBeJoinedSnap.data(),
          };

          const joinedData = {
            ...data,
            [field]: dataToBeJoined,
          } as T;
          joinedArray.push(joinedData);
        }

        dispatch(actions.success(joinedArray));
      })
      .catch((err) => {
        console.log("error joining from left", err);
        dispatch(actions.error?.(err.message));
      });
  }
};
