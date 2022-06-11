import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Builder } from "./features/builder/Builder";
import "./App.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <Builder />
      </div>
    </ThemeProvider>
  );
}

export default App;
