import avatar from "@app/assets/avatar.svg";
import Header from "./Header";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { SunIcon } from "@heroicons/react/24/solid";
import ParamCard from "./ParamCard";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import { route } from "preact-router";
import { userLogout, getUser, getWifi, checkInternet, getSensorData, changeUserInfo, changeWifiInfo, getFirebaseData, downloadSensorData } from "@app/API/API";
import { useEffect, useState } from "preact/hooks";
import { YAxis, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { nanoid } from "nanoid";
import { ArrowDownTrayIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

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

type temperatureData = {
  temperature: number;
  timeStamp: string;
};

type humidityData = {
  humidity: number;
  timeStamp: string;
};

type GraphButtonProps = {
  label: string;
  isActive?: boolean;
  onClick?: (num: number, key?: string, param?: "temperature" | "humidity") => void;
};

const GraphButton = ({ label, isActive, onClick }: GraphButtonProps) => {
  const num = parseInt(label, 10);
  return (
    <button className={`text-md font-bold py-1 px-4 hover:bg-gray-200 cursor-pointer ${isActive ? "bg-gray-300" : ""} transition-all duration-200 active:bg-gray-300`} onClick={() => onClick?.(num)}>
      {label}
    </button>
  );
};

const statusCard = ({ isNormal }: { isNormal: boolean }) => {
  return (
    <div
      className={`px-4 py-2
         ${isNormal ? "bg-green-800" : "bg-red-800"} flex flex-row rounded-lg shadow-lg justify-between items-center`}
    >
      <div className="text-primary w-full">
        <h1 className="font-extrabold text-2xl md:text-3xl lg:text-4xl">{isNormal ? "Aman" : "Perhatian!!"}</h1>
        <p className="text-gray-50 text-sm md:text-lg lg:text-xl w-3/4">{isNormal ? "Semua parameter dalam kondisi normal." : "Salah satu parameter tidak ideal untuk penyimpanan obat"}</p>
      </div>
      {isNormal ? <CheckCircleIcon className="size-25 text-primary" /> : <ExclamationCircleIcon className="size-25 text-primary" />}
    </div>
  );
};

const MainPage = ({}: MainPageProps) => {
  const [username, setUsername] = useState<string>("");
  const [wifiSsid, setWifiSsid] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [UserChangeMessage, setUserChangeMessage] = useState<string>("");

  const [temperatureData, setTemperatureData] = useState<temperatureData[]>([]);
  const [humidityData, setHumidityData] = useState<humidityData[]>([]);
  const [isUserChanged, setIsUserChanged] = useState<boolean>(false);
  const [wifiChangeMessage, setWifiChangeMessage] = useState<string>("");
  const [isWifiChanged, setIsWifiChanged] = useState<boolean>(false);
  const [isTemperatureNormal, setIsTemperatureNormal] = useState<boolean>(true);
  const [isHumidityNormal, setIsHumidityNormal] = useState<boolean>(true);

  const [temperatureGraphButtonState, setTemperatureGraphButtonState] = useState<{ label: string; isActive: boolean; key: string; param: "temperature" | "humidity" }[]>([
    { label: "100", isActive: false, key: nanoid(), param: "temperature" },
    { label: "200", isActive: false, key: nanoid(), param: "temperature" },
    { label: "300", isActive: false, key: nanoid(), param: "temperature" },
  ]);

  const [humidityGraphButtonState, setHumidityGraphButtonState] = useState<{ label: string; isActive: boolean; key: string; param: "temperature" | "humidity" }[]>([
    { label: "100", isActive: false, key: nanoid(), param: "humidity" },
    { label: "200", isActive: false, key: nanoid(), param: "humidity" },
    { label: "300", isActive: false, key: nanoid(), param: "humidity" },
  ]);

  const [displayedDataCount, setDisplayedDataCount] = useState<{
    temperature: number;
    humidity: number;
  }>({
    temperature: 0,
    humidity: 0,
  });

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
          if (response.temperature > 25) {
            setIsTemperatureNormal(false);
          } else {
            setIsTemperatureNormal(true);
          }

          if (response.humidity < 30 || response.humidity > 70) {
            setIsHumidityNormal(false);
          } else {
            setIsHumidityNormal(true);
          }

          setTemperatureData((prevData) => [...prevData, { temperature: response.temperature, timeStamp: response.timestamp }]);
          setHumidityData((prevData) => [...prevData, { humidity: response.humidity, timeStamp: response.timestamp }]);
          setDisplayedDataCount((prevCount) => ({
            temperature: prevCount.temperature + 1,
            humidity: prevCount.humidity + 1,
          }));
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
    }, 1000);
    const measurementInterval = setInterval(() => {
      getMeasurementData();
    }, 2000);
    getMeasurementData();
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

  const updateMeasurementData = async (param: "temperature" | "humidity", num: number) => {
    try {
      const sensorDataArray = await getFirebaseData(num);
      if (!sensorDataArray) {
        console.error("No data received from Firebase.");
        return;
      }

      if (param === "temperature") {
        const newTemperatureData = sensorDataArray.map(
          (data: any): temperatureData => ({
            temperature: data.temperature,
            timeStamp: data.timestamp,
          })
        );
        setTemperatureData(newTemperatureData);
      } else if (param === "humidity") {
        const newHumidityData = sensorDataArray.map(
          (data: any): humidityData => ({
            humidity: data.humidity,
            timeStamp: data.timestamp,
          })
        );
        setHumidityData(newHumidityData);
      }
    } catch (error) {
      console.error("Error fetching Firebase data:", error);
    }
  };

  const handleGraphButtonClick = (label: string, key: string, param: "temperature" | "humidity") => {
    const num = parseInt(label, 10);
    if (param === "temperature") {
      setTemperatureGraphButtonState((prevState) => {
        return prevState.map((button) => {
          if (button.key === key) {
            return { ...button, isActive: !button.isActive };
          }
          return { ...button, isActive: false };
        });
      });
    } else if (param === "humidity") {
      setHumidityGraphButtonState((prevState) => {
        return prevState.map((button) => {
          if (button.key === key) {
            return { ...button, isActive: !button.isActive };
          }
          return { ...button, isActive: false };
        });
      });
    }
    updateMeasurementData(param, num);
    setDisplayedDataCount((prevCount) => {
      return {
        ...prevCount,
        [param]: num,
      };
    });
  };

  const downloadData = async () => {
    try {
      const blobData = await downloadSensorData();
      if (!blobData) {
        console.error("No data received for download.");
        return;
      }

      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sensor_data.json";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading data:", error);
    }
  };
  return (
    <div className="flex-1">
      <Header className="relative" />
      {/* Main Container  Start */}
      <div className="mx-auto flex justify-center px-4 pt-4 container flex-col">
        <div className="container bg-primary shadow-lg rounded-xl py-2 md:p-4 flex justify-between items-center border border-secondary-muted mb-2">
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
        {statusCard({ isNormal: isTemperatureNormal && isHumidityNormal })}
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
            <div className="bg-primary shadow-lg rounded-2xl p-4  flex flex-col w-full border border-secondary-muted min-h-35">
              <div className="ml-10 flex flex-col">
                <h1 className="text-secondary font-bold text-2xl md:text-2xl mb-1">Suhu</h1>
                <p className="text-sm text-muted">Menampilkan {`${displayedDataCount.temperature}`} data suhu </p>
                <div className={`flex border-secondary-muted justify-between  mb-2 border-b items-center ${connected ? "" : "opacity-50 cursor-not-allowed pointer-events-none"} `}>
                  <div className="flex">
                    {temperatureGraphButtonState.map((button) => (
                      <GraphButton key={button.key} label={button.label} isActive={button.isActive} onClick={() => handleGraphButtonClick(button.label, button.key, button.param)} />
                    ))}
                  </div>
                  <div className="py-2 px-4 hover:bg-gray-300 transition-all cursor-pointer active:bg-gray-300">
                    <ArrowDownTrayIcon className="size-6 text-secondary" onClick={() => downloadData()} />
                  </div>
                </div>
              </div>
              <div className="h-35">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeStamp" type="category" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="temperature" stroke="#ffb900" fillOpacity={0.3} fill="#ffb900" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-primary shadow-lg rounded-2xl p-4 flex flex-col w-full border border-secondary-muted min-h-35">
              <div className="ml-10 flex flex-col">
                <h1 className="text-secondary font-bold text-2xl md:text-2xl  mb-2">Kelembapan</h1>
                <p className="text-sm text-muted">Menampilkan {`${displayedDataCount.humidity}`} data kelembapan </p>
                <div className={`flex border-secondary-muted justify-between  mb-2 border-b items-center ${connected ? "" : "opacity-50 cursor-not-allowed pointer-events-none"} `}>
                  <div className={"flex"}>
                    {humidityGraphButtonState.map((button) => (
                      <GraphButton key={button.key} label={button.label} isActive={button.isActive} onClick={() => handleGraphButtonClick(button.label, button.key, button.param)} />
                    ))}
                  </div>
                  <div className="py-2 px-4 hover:bg-gray-300 transition-all cursor-pointer active:bg-gray-300">
                    <ArrowDownTrayIcon className="size-6 text-secondary" onClick={() => downloadData()} />
                  </div>
                </div>
              </div>

              <div className="h-35">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={humidityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeStamp" type="category" />
                    <YAxis domain={[50, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="humidity" stroke="#82ca9d" fillOpacity={0.3} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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
