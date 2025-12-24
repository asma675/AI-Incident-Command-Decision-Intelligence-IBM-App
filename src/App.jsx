import "./App.css";
import Pages from "@/pages/index.jsx";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Pages />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
