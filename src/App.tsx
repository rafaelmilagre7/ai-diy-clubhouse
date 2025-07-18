
import React from 'react';
import { ThemeProvider } from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div style={{ padding: 40, color: "green", fontSize: "24px" }}>APP funcionando com ThemeProvider</div>
    </ThemeProvider>
  );
}

export default App;
