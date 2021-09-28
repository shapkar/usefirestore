import {
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
} from "@firebase/firestore";

export type CollectionOptions = {
  listen?: boolean;
  listenerName?: string;
  sort?: SortOptions;
  queries?: QueryOptions[];
  limit?: number;
  lazyLoad?: boolean;
};

export type DocumentOptions = {
  listen?: boolean;
  listenerName?: string;
  subcollections?: Subcollection[];
};

export interface Subcollection {
  path: string;
  storeAs: string;
  subcollections?: Subcollection[];
  collectionOptions?: Omit<
    CollectionOptions,
    "listen" | "listenerName" | "lazyLoad"
  >;
}

type SortOptions = {
  attribute: string;
  order: OrderByDirection;
};

type QueryOptions = {
  attribute: string | FieldPath;
  operator: WhereFilterOp;
  value: string | number | boolean | any[] | Date;
};
