/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-container": "#fcffe2",
        "inverse-surface": "#343025",
        "tertiary": "#566032",
        "secondary-fixed": "#cbecc0",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "on-background": "#1f1b11",
        "secondary": "#4a6544",
        "outline": "#867275",
        "error-container": "#ffdad6",
        "on-primary-fixed": "#3e0315",
        "on-error": "#ffffff",
        "primary-fixed": "#ffd9de",
        "surface-variant": "#ebe2d1",
        "on-primary-container": "#fffbff",
        "inverse-primary": "#ffb2be",
        "tertiary-container": "#6f7948",
        "on-secondary-fixed": "#072106",
        "error": "#ba1a1a",
        "surface-dim": "#e2d9c8",
        "surface-tint": "#934656",
        "primary": "#904354",
        "secondary-fixed-dim": "#b0cfa6",
        "on-secondary-fixed-variant": "#324d2e",
        "tertiary-fixed": "#dde8ad",
        "surface-container-highest": "#ebe2d1",
        "secondary-container": "#cbecc0",
        "background": "#fff8f0",
        "surface-container-high": "#f0e7d6",
        "on-primary-fixed-variant": "#762f3f",
        "outline-variant": "#d8c1c3",
        "surface-bright": "#fff8f0",
        "on-secondary-container": "#4f6c49",
        "on-primary": "#ffffff",
        "on-error-container": "#93000a",
        "primary-container": "#ae5b6c",
        "inverse-on-surface": "#f9f0de",
        "on-surface-variant": "#534345",
        "on-tertiary-fixed": "#171e00",
        "tertiary-fixed-dim": "#c1cc93",
        "on-tertiary-fixed-variant": "#414b1f",
        "surface": "#fff8f0",
        "primary-fixed-dim": "#ffb2be",
        "on-surface": "#1f1b11",
        "surface-container-low": "#fcf3e1",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#f6eddc"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "container-padding-mobile": "20px",
        "card-inner-padding": "24px",
        "base": "8px",
        "gutter": "16px",
        "section-gap": "32px",
        "container-padding-desktop": "40px"
      },
      fontFamily: {
        "body-lg": ["Be Vietnam Pro"],
        "label-md": ["Be Vietnam Pro"],
        "body-md": ["Be Vietnam Pro"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "caption": ["Be Vietnam Pro"],
        "headline-md": ["Plus Jakarta Sans"],
        "display-lg": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "label-md": ["14px", {"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
        "headline-lg-mobile": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}],
        "caption": ["12px", {"lineHeight": "1.4", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
        "display-lg": ["40px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "600"}]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};
