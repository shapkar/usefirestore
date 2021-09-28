# usefirestore

> This package helps you to easy combine React, Redux and Firestore using hook. Read more at medium.com/exelerate

[![NPM](https://img.shields.io/npm/v/usefirestore.svg)](https://www.npmjs.com/package/usefirestore) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save usefirestore
```

```bash
yarn add usefirestore
```

## Usage

```tsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { GenericActions, useFirestore } from "usefirestore";
import { CollectionOptions } from "../../dist/types";
import { db } from "./config";
import { slice, selector } from "./redux/slices/notification";
import { Notification } from "./redux/slices/notification";

const reduxFirestoreActions: GenericActions<Notification> = {
  loading: slice.actions.loading,
  success: slice.actions.setAll,
  error: slice.actions.error,
};

const firestoreCollectionOptions: CollectionOptions = {
  listen: true,
  queries: [{ attribute: "date", operator: "<", value: new Date() }],
};

const App = () => {
  const ref = useFirestore<Notification>(db, "notifications");
  const notifications = useSelector(selector.selectAll);

  useEffect(() => {
    ref.collection(reduxFirestoreActions, firestoreCollectionOptions);
  }, []);

  const handleUseFirestoreMethods = () => {
    ref.add({ message: "", date: new Date().toString() });
    ref.update("id", { message: "" });
  };

  return (
    <div>
      {notifications.map((n) => (
        <span>{n.message}</span>
      ))}
    </div>
  );
};
export default App;
```

## License

MIT © [shapkar](https://github.com/shapkar)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
