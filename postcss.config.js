// Vite picks this up automatically and runs it over every stylesheet.
//
// Added because every vendor prefix in style.css and responsive.css was
// hand-written, which is a rule that only holds until someone forgets: one
// backdrop-filter had already shipped without its -webkit- twin, so the blur
// was simply absent on iOS and Safari. Prefixes are now generated from the
// browserslist field in package.json rather than remembered.
export default {
  plugins: {
    autoprefixer: {},
  },
};
