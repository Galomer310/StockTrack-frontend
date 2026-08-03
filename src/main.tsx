import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import "./style.css";
import "./responsive.css"; // Motion + breakpoints; imported last so it wins the cascade
import "./charts/chartTheme"; // Global Chart.js defaults for the dark theme

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
