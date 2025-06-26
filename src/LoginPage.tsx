import puskesmasLogo from "@app/assets/puskesmas-fs8.png";
import bjb from "@app/assets/bjb.jpg";
import Header from "@app/Header";
import { route } from "preact-router";
import { useState, useEffect } from "preact/hooks";
import { checkInternet, userLogin } from "@app/API/API";

interface LoginPageProps {
  path: string;
}

const LoginPage = ({}: LoginPageProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<string>("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkInternet();
        console.log("Koneksi internet:", isConnected);
        setIsConnected(isConnected);
      } catch (error) {
        console.error("Error checking internet connection:", error);
      }
    };
    checkConnection();
  }, []);

  const handlerLogin = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.querySelector('input[type="text"]') as HTMLInputElement).value;
    const password = (form.querySelector('input[type="password"]') as HTMLInputElement).value;

    if (!username || !password) {
      setLoginStatus("Username dan password tidak boleh kosong.");
      setTimeout(() => {
        setLoginStatus("");
      }, 3000);
      return;
    }
    const isLoginSuccessful = await userLogin(username, password);
    if (isLoginSuccessful) {
      route("/main");
    } else {
      setLoginStatus("Login gagal. Periksa username dan password Anda.");
      setTimeout(() => {
        setLoginStatus("");
      }, 3000);
    }
  };

  return (
    <div>
      <Header className="absolute" />
      <main className="container mx-auto px-4 min-h-screen flex items-center justify-center lg:w-[900px]">
        <div className="lg:flex lg:items-center lg:bg-gray-50 lg:shadow-lg lg:rounded-3xl lg:overflow-hidden lg:gap-8">
          <div className="flex flex-col gap-2 bg-gray-50 shadow-md rounded-lg p-4 lg:w-1/2 lg:bg-transparent lg:shadow-none lg:ml-8 lg:my-8">
            <div className="flex gap-4 items-center">
              <img src={puskesmasLogo} className="size-32 sm:size-36" />
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Login</h1>
                <p className="text-slate-500 text-sm sm:text-base sm:w-3/4 lg:w-full w-fit">Silakan masukkan username dan password untuk melanjutkan</p>
              </div>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                handlerLogin(e);
              }}
            >
              <label className="text-slate-800 font-bold text-md">Username</label>
              <input type="text" placeholder="Username" className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <label className="text-slate-800 font-bold text-md">Password</label>
              <input type="password" placeholder="Password" className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-300" />
              <button type="submit" className="bg-neutral-800 text-white rounded-md p-2 hover:bg-neutral-900 transition-all">
                Login
              </button>
            </form>
            <p className="text-center text-sm text-red-500">{loginStatus}</p>
            <p className="text-center text-sm text-slate-500">
              Status Perangkat: <span className={`${isConnected ? "text-green-500" : "text-red-500"}`}>{isConnected ? "Terkoneksi" : "Mode Offline"}</span>
            </p>
          </div>
          <div className="hidden lg:block lg:w-1/2 self-stretch">
            <img src={bjb} className="w-full h-full object-cover" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
