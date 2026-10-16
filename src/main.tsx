import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import { ToastProvider } from "./components/ui/ToastProvider";
import { LanguageProvider } from "./i18n/LanguageProvider";
import "./style.css";
import "./responsive.css"; // Motion + breakpoints; imported last so it wins the cascade

// chartTheme is deliberately NOT imported here. Importing it for its side
// effects put Chart.js in the entry graph, so every visitor downloaded the
// charting library before the first paint - including on the login screen,
// which has no chart on it. Each chart component imports the module itself
// for its palette, and it registers the Chart.js plugins and applies the
// dark-theme defaults at module scope, idempotently. The defaults therefore
// land exactly when a chart is first loaded, which is the only moment they
// matter.

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  </Provider>
);
