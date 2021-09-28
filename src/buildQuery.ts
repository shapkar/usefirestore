import {
  Firestore,
  collection,
  where,
  orderBy,
  limit,
  query,
  CollectionReference,
  QueryConstraint,
} from "@firebase/firestore";
import { CollectionOptions } from "./types";

export const buildQuery = (
  firestore: Firestore,
  ref: string | CollectionReference,
  options?: CollectionOptions
) => {
  const constraints: QueryConstraint[] = [];

  if (options && options.queries) {
    options.queries.forEach((q) => {
      constraints.push(where(q.attribute, q.operator, q.value));
    });
  }

  if (options && options.sort) {
    constraints.push(orderBy(options.sort.attribute, options.sort.order));
  }

  if (options && options.limit) constraints.push(limit(options.limit));

  const collectionQuery = query(
    typeof ref === "string" ? collection(firestore, ref) : ref,
    ...constraints
  );

  return collectionQuery;
};
