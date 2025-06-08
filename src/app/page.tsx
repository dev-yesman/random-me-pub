
import Header from "./components/Header";
import Footer from "./components/Footer";
import ActionButton from "./components/ActionButton";
import MapSection from "./components/MapSection";
import { RouletteProvider } from "./contexts/RouletteContext";

export default function Home() {
  return (
    <RouletteProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 min-h-0 relative">
          <MapSection />
        </main>
        <Footer />
        <ActionButton />
      </div>
    </RouletteProvider>
  );
}
