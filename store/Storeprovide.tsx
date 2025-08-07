"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { ToastContainer } from "@/components/ui/toast";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ToastContainer />

      {children}
    </Provider>
  );
}
