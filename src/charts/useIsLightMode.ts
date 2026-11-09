import { useEffect, useState } from "react";

// The app is dark by default and toggles `light-mode` on <body>. The chart
// palette has its own steps per surface, so a chart has to know which is
// showing and re-render when it changes - an automatic flip of the dark
// colours would not clear the contrast floors on white.
export const useIsLightMode = (): boolean => {
  const [light, setLight] = useState(() => document.body.classList.contains("light-mode"));

  useEffect(() => {
    const observer = new MutationObserver(() => setLight(document.body.classList.contains("light-mode")));
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return light;
};
