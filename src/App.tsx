import bgPattern from "@app/assets/topography.svg";
import Footer from "./Footer";
import Router from "preact-router";
import LoginPage from "./LoginPage";
import MainPage from "./MainPage";

export function App() {
  return (
    <div>
      <div
        className="fixed top-0 left-0 w-full h-[200%] bg-repeat opacity-10 -z-10"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "auto",
        }}
      ></div>
      <div className="flex flex-col min-h-screen">
        <Router>
          <LoginPage path="/" />
          <MainPage path="/main" />
        </Router>
        <Footer />
      </div>
    </div>
  );
}
