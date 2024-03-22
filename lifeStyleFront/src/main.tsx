import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./css/bootstrap.min.css";
import "./css/style.css";
import { AuthProvider } from "./context/Context";

// allow us to connect redux to react components
// import { Provider } from "react-redux";
// import { store } from "./state/store.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* store is accessible to all the App children */}
    {/* <Provider store={store}> */}
    <AuthProvider>
      <App />
    </AuthProvider>
    {/* </Provider> */}
  </React.StrictMode>
);
