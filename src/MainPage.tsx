import avatar from "@app/assets/avatar.svg";
import Header from "./Header";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { SunIcon } from "@heroicons/react/24/solid";
import ParamCard from "./ParamCard";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { route } from "preact-router";
import { userLogout, getUser, getWifi, checkInternet, getSensorData, changeUserInfo, changeWifiInfo } from "@app/API/API";
import { useEffect, useState } from "preact/hooks";
import { YAxis, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const DropletIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={`${className}`} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 384 512">
      <path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0l1.8 0c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192zM96 336c0-8.8-7.2-16-16-16s-16 7.2-16 16c0 61.9 50.1 112 112 112c8.8 0 16-7.2 16-16s-7.2-16-16-16c-44.2 0-80-35.8-80-80z" />
    </svg>
  );
};

interface MainPageProps {
  path?: string;
}

type sensorData = {
  temperature: number;
  humidity: number;
  unixtimeStamp: number;
  timeStamp: string;
};

const MainPage = ({}: MainPageProps) => {
  const [username, setUsername] = useState<string>("");
  const [wifiSsid, setWifiSsid] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [UserChangeMessage, setUserChangeMessage] = useState<string>("");
  const [measurementData, setMeasurementData] = useState<sensorData[]>([]);
  const [isUserChanged, setIsUserChanged] = useState<boolean>(false);
  const [wifiChangeMessage, setWifiChangeMessage] = useState<string>("");
  const [isWifiChanged, setIsWifiChanged] = useState<boolean>(false);
  const [isTemperatureNormal, setIsTemperatureNormal] = useState<boolean>(true);
  const [isHumidityNormal, setIsHumidityNormal] = useState<boolean>(true);

  useEffect(() => {
    const userData = async () => {
      try {
        const user = await getUser();
        if (user) {
          setUsername(user.username);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername("unknown");
      }
    };

    const wifiData = async () => {
      try {
        const wifi = await getWifi();
        if (wifi) {
          setWifiSsid(wifi.ssid);
        }
      } catch (error) {
        console.error("Error fetching WiFi data:", error);
        setWifiSsid("unknown");
      }
    };

    const checkInter = async () => {
      try {
        const isConnected = await checkInternet();
        setConnected(isConnected);
      } catch (error) {
        console.error("Error checking internet connection:", error);
        setConnected(false);
      }
    };

    const getMeasurementData = async () => {
      try {
        const response = await getSensorData();
        if (response) {
          console.log("Sensor data:", response);
          setTemperature(response.temperature);
          setHumidity(response.humidity);
          if (response.temperature > 32) {
            setIsTemperatureNormal(false);
          } else {
            setIsTemperatureNormal(true);
          }

          if (response.humidity < 60 || response.humidity > 75) {
            setIsHumidityNormal(false);
          } else {
            setIsHumidityNormal(true);
          }

          setMeasurementData((prevData) => [
            ...prevData,
            {
              temperature: response.temperature,
              humidity: response.humidity,
              unixtimeStamp: response.unixtimestamp,
              timeStamp: response.timestamp,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching measurement data:", error);
        if (error === "Invalid") {
          route("/");
        }
      }
    };

    const interval = setInterval(() => {
      checkInter();
    }, 5000);
    const measurementInterval = setInterval(() => {
      getMeasurementData();
    }, 2000);
    wifiData();
    userData();

    return () => {
      clearInterval(interval);
      clearInterval(measurementInterval);
    };
  }, []);

  const handleChangeUser = async (newUsername: string, newPassword: string) => {
    try {
      if (!newUsername || !newPassword) {
        setTimeout(() => {
          setUserChangeMessage("");
        }, 5000);
        setUserChangeMessage("Username and Password cannot be empty.");
        return;
      }
      const response = await changeUserInfo(newUsername, newPassword);
      console.log("Response from changeUserInfo:", response);
      if (response[1]) {
        setTimeout(() => {
          userLogout();
          route("/");
        }, 5000);
        setIsUserChanged(true);
        setUserChangeMessage(response[0]);
      } else {
        setTimeout(() => {
          setUserChangeMessage("");
        }, 5000);
        setIsUserChanged(false);
        setUserChangeMessage(response[0]);
      }
    } catch (error) {
      console.error("Error changing user information:", error);
    }
  };
  const handleLogout = async () => {
    try {
      await userLogout();
      route("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleChangeWifi = async (ssid: string, password: string) => {
    try {
      if (!ssid || !password) {
        setTimeout(() => {
          setWifiChangeMessage("");
        }, 5000);
        setWifiChangeMessage("SSID and Password cannot be empty.");
        return;
      }
      const response = await changeWifiInfo(ssid, password);
      console.log("Response from changeWifi:", response);
      if (response[1]) {
        setTimeout(() => {
          userLogout();
          route("/");
        }, 5000);
        setIsWifiChanged(true);
        setWifiChangeMessage(response[0]);
      } else {
        setTimeout(() => {
          setWifiChangeMessage("");
        }, 5000);
        setIsWifiChanged(false);
        setWifiChangeMessage(response[0]);
      }
    } catch (error) {
      console.error("Error changing WiFi information:", error);
    }
  };
  return (
    <div className="flex-1">
      <Header className="relative" />
      {/* Main Container  Start */}
      <div className="mx-auto flex justify-center px-4 pt-4 container flex-col">
        <div className="container bg-primary shadow-lg rounded-xl py-2 md:p-4 flex justify-between items-center border border-secondary-muted">
          <div className="flex items-center">
            <img src={avatar} alt="Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <BuildingOffice2Icon className="size-6" />
                <h1 className="text-2xl font-bold text-secondary">Ruangan I</h1>
              </div>
              <p className="text-secondary text-md font-bold">{`Selamat Datang ${username}`}</p>
              <p className="text-muted text-sm">Dashboard Monitoring Suhu Ruangan I puskesmas</p>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted ">Status Perangkat:</span>
                <span className={connected ? "text-green-500" : "text-red-500"}>{connected ? "Terkoneksi" : "mode offline"}</span>
              </div>
              <p className="text-muted text-sm">
                Terhubung ke : <span className={"font-bold"}>{wifiSsid}</span>
              </p>
            </div>
          </div>
          <button className="mr-2 p-2 rounded-lg border border-secondary-muted group">
            <ArrowRightOnRectangleIcon
              className="size-8 md:size-10 text-secondary group-hover:translate-x-2 group-hover:text-secondary-muted transition-all  "
              onClick={async () => {
                await handleLogout();
              }}
            />
          </button>
        </div>
        <div className="flex flex-col lg:flex-row  gap-2 mt-4 ">
          {/* Card Start */}
          <div className="flex gap-2  lg:flex-col lg:w-1/4 self-stretch">
            {/* Card Suhu Start */}
            <ParamCard title="Suhu" value={temperature} unit="°" icon={SunIcon} iconStyle="size-14 text-yellow-500" isPrimary={false} isAboveThreshold={!isTemperatureNormal} />
            {/* Card Suhu End */}
            {/* Card Kelembapan Start */}
            <ParamCard title="Kelembapan" value={humidity} unit="" icon={DropletIcon} iconStyle="size-12 text-blue-500 " isPrimary={true} isAboveThreshold={!isHumidityNormal} />
            {/* Card Kelembapan End */}
          </div>
          {/* Card End */}
          {/* Chart Start */}
          <div className="flex flex-col gap-2 mt-0 w-full">
            <div className="bg-primary shadow-lg rounded-2xl p-4  flex flex-col w-full border border-secondary-muted h-60">
              <h1 className="text-secondary font-bold text-2xl md:text-2xl ml-10 mb-2">Suhu</h1>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={measurementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeStamp" type="category" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="temperature" stroke="#ffb900" fillOpacity={0.3} fill="#ffb900" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-primary shadow-lg rounded-2xl p-4 flex flex-col w-full border border-secondary-muted h-60">
              <h1 className="text-secondary font-bold text-2xl md:text-2xl ml-10 mb-2">Kelembapan</h1>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={measurementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeStamp" type="category" />
                  <YAxis domain={[50, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="humidity" stroke="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Chart End */}
        </div>
        {/* Configuration Card Start */}
        <div className="flex flex-col mt-2 gap-2 md:flex-row md:w-full mb-8">
          <div className="bg-primary shadow-lg rounded-xl p-4 flex flex-col md:w-1/2 border border-secondary-muted">
            <h1 className="text-secondary font-bold text-2xl md:text-2xl mb-4">Konfigurasi Pengguna</h1>
            <p className={`font-bold text-sm mb-2 ${isUserChanged ? "text-green-500" : "text-red-500"} ${UserChangeMessage === "" ? "hidden" : ""}`}>{UserChangeMessage}</p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const username = (e.target as any).username.value;
                const password = (e.target as any).password.value;
                handleChangeUser(username, password);
              }}
            >
              <label className="text-secondary font-bold text-md" htmlFor="username">
                Username
              </label>
              <input className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-300" type="text" id="username" />
              <label className="text-secondary font-bold text-md" htmlFor="password">
                Password
              </label>
              <input className="border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-slate-300" type="password" id="password" />
              <button
                className="bg-primary text-secondary p-2 hover:ring-2 hover:ring-secondary-muted  rounded-md transition-all mt-2 border border-secondary-muted
              "
                type="submit"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
          <div
            className="bg-secondary shadow-lg rounded-xl p-4 flex flex-col md:w-1/2
          "
          >
            <h1 className="text-primary font-bold text-xl md:text-2xl mb-4">Konfigurasi Jaringan</h1>
            <p className={`font-bold text-sm mb-2 ${isWifiChanged ? "text-green-500" : "text-red-500"} ${wifiChangeMessage === "" ? "hidden" : ""}`}>{wifiChangeMessage}</p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const ssid = (e.target as any)["wifi-ssid"].value;
                const password = (e.target as any)["wifi-password"].value;
                handleChangeWifi(ssid, password);
              }}
            >
              <label className="text-primary font-bold text-md" htmlFor="username">
                SSID
              </label>
              <input className="border border-muted rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-neutral-500 text-primary" type="text" id="wifi-ssid" />
              <label className="text-primary font-bold text-md" htmlFor="password">
                Password
              </label>
              <input className="text-primary border border-muted rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-neutral-500" type="password" id="wifi-password" />
              <button
                className="bg-secondary text-primary p-2 hover:ring-2 hover:ring-muted  rounded-md transition-all mt-2 border border-muted
              "
                type="submit"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Main Container End */}
    </div>
  );
};

export default MainPage;
