import { MutableRefObject } from "react";
import { GenericActions, ListenerState } from "./index";
import {
  Firestore,
  doc,
  onSnapshot,
  getDoc,
  DocumentReference,
  DocumentData,
  collection,
  getDocs,
} from "@firebase/firestore";
import { DocumentOptions, Subcollection } from "./types";
import { buildQuery } from "./buildQuery";

const docApi = async <T>(
  firestore: Firestore,
  path: string,
  id: string,
  actions: GenericActions<T>,
  dispatch: any,
  docListenersRef?: MutableRefObject<ListenerState[]>,
  options?: DocumentOptions
) => {
  const docRef = doc(firestore, path, id);

  dispatch(actions?.loading?.());

  if (options?.listen && docListenersRef) {
    const listener = onSnapshot(docRef, (doc) => {
      if (!doc.exists()) {
        dispatch(actions.error?.(`Document with id: ${id} does not exist.`));
        return;
      }
      dispatch(actions.success({ id: doc.id, ...doc.data() } as unknown as T));
    });

    docListenersRef.current.push({
      name: options.listenerName,
      unsubscribe: listener,
    });
  } else {
    try {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await dispatch(actions.error?.("Document does not exists."));
        throw doc;
      }

      let result: DocumentData = { id: docSnap.id, ...docSnap.data() };
      await dispatch(actions.success(result as T));

      const subcollections = await getSubcollectionsForDocument(
        firestore,
        docRef,
        options?.subcollections
      );
      result = { ...result, ...subcollections };

      await dispatch(actions.success(result as T));
    } catch (err) {
      console.error("get document error", err);
      dispatch(actions.error?.((err as any).message));
    }
  }
};

const getSubcollectionsForDocument = async (
  firestore: Firestore,
  docRef: DocumentReference<DocumentData>,
  subcollections?: Subcollection[]
) => {
  if (!subcollections) return {};

  const subs = {};
  for (const subcoll of subcollections) {
    const collectionQuery = buildQuery(
      firestore,
      collection(firestore, `${docRef.path}/${subcoll.path}`),
      subcoll.collectionOptions
    );

    const snap = await getDocs(collectionQuery);

    const innerDocs = [];
    if (!snap.empty || snap.docs.length) {
      for (let index = 0; index < snap.docs.length; index++) {
        const doc = snap.docs[index];
        innerDocs.push({
          id: doc.id,
          ...doc.data(),
          ...(await getSubcollectionsForDocument(
            firestore,
            docRef,
            subcoll.subcollections
          )),
        });
      }
    }
    subs[subcoll.storeAs] = innerDocs;
  }

  return subs;
};

export default docApi;
