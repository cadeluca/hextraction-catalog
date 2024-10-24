export default function App({ Component, pageProps }) {
  if (typeof window !== 'undefined') {
    const storedHue = localStorage.getItem('nextra-primary-hue');
    if (storedHue) {
      document.documentElement.style.setProperty('--nextra-primary-hue', `${storedHue}deg`);
    }
  }

  return <Component {...pageProps} />;
}

// import { ThemeProvider, useTheme } from "next-themes";
// import { useEffect } from "react";

// function HueSetter() {
//   const { theme } = useTheme();

//   useEffect(() => {
//     const storedHue = localStorage.getItem("nextra-primary-hue");
//     if (storedHue) {
//       document.documentElement.style.setProperty(
//         "--nextra-primary-hue",
//         `${storedHue}deg`
//       );
//     }
//   }, [theme]); // Re-run when the theme changes

//   return null;
// }

// function MyApp({ Component, pageProps }) {
//   return (
//     <ThemeProvider attribute="class" defaultTheme="system">
//       <HueSetter />
//       <Component {...pageProps} />
//     </ThemeProvider>
//   );
// }

// export default MyApp;
