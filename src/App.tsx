import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { ChatApp } from "./components/ChatApp";
import "./styles.css";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <ChatApp />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-cyan-500/30 rounded-full animate-spin" style={{ borderTopColor: '#06b6d4' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 md:w-14 md:h-14 border-2 border-orange-500/30 rounded-full animate-spin" style={{ borderTopColor: '#f97316', animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-gradient-to-br from-cyan-400 to-orange-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default App;
