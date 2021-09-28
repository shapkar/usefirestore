import { useFirestore } from "./";
import { renderHook, act } from "@testing-library/react-hooks";
import { initializeApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

// mock timer using jest
jest.useFakeTimers();

describe("useMyHook", () => {
  it("updates every second", () => {
    const { result } = renderHook(() => useFirestore(firestore, "test"));

    expect(result.current).toBe(0);

    // Fast-forward 1sec
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check after total 1 sec
    expect(result.current).toBe(1);

    // Fast-forward 1 more sec
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check after total 2 sec
    expect(result.current).toBe(2);
  });
});
