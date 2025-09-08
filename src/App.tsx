import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;