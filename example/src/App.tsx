import { useEffect } from "react";
import { useSelector } from "react-redux";
import { GenericActions, useFirestore } from "usefirestore";
import { CollectionOptions } from "../../dist/types";
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
  const ref = useFirestore<Notification>("notifications");
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
