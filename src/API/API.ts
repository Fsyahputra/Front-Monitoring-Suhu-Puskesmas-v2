import axios, { type InternalAxiosRequestConfig } from "axios";
import { decryptJson, encrypt, encryptJson, generateRandomIv, toBase64 } from "@app/encryption";
import { type EncryptedData } from "@app/encryption";
import { route } from "preact-router";

const API_BASE_URL = window.location.origin;
const PRIMARY_KEY = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

interface sensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
  unixtimestamp: number;
}

const getToken = (): string => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token not found in localStorage");
  }
  return token;
};

const isJson = (request: InternalAxiosRequestConfig): boolean => {
  const contentType = request.headers["Content-Type"] || request.headers["content-type"];
  const isJsonContentType = contentType?.includes("application/json");
  const isJson: boolean = request.data && typeof request.data === "object" && isJsonContentType;
  return isJson;
};

const getKey = (): string => {
  const key = localStorage.getItem("key");
  if (!key) {
    throw new Error("Encryption key not found in localStorage");
  }
  return key;
};

export const JSONRequest = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 1000000, // Set a timeout of 10 seconds
});

export const commRequest = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000, // Set a timeout of 10 seconds
});

JSONRequest.interceptors.request.use((config) => {
  const token = getToken();
  const key = getKey();

  if (!isJson(config)) {
    throw new Error("Request data must be a JSON object");
  }

  const encryptedData: EncryptedData = encryptJson(config.data, key);

  config.data = {
    token: token,
    ...encryptedData,
  };

  return config;
});

const decryptResponse = (response: any): any => {
  const key = getKey();
  const data: EncryptedData = response.data;
  if (!data.cipher || !data.iv) {
    throw new Error("Invalid response format: missing iv or cipher");
  }
  const decryptedData = decryptJson(data, key);
  return decryptedData;
};

export async function checkInternet(): Promise<boolean> {
  try {
    const response = await commRequest.get("/checkConnection");
    if (response.data.status !== "connected") {
      return false;
    }
  } catch (error) {
    console.error("Error checking internet connection:", error);
    return false;
  }
  return true;
}

export async function userLogin(username: string, password: string): Promise<boolean> {
  try {
    console.log("Attempting to log in with username:", username);
    const plainTextPassword = password;
    const iv = generateRandomIv();
    const primaryKey = PRIMARY_KEY;
    const base64iv = toBase64(iv);
    const encryptedBase64Password = encrypt(plainTextPassword, toBase64(primaryKey), base64iv);
    const data = new URLSearchParams();
    data.append("username", username);
    data.append("password", encryptedBase64Password);
    data.append("iv", base64iv);
    const response = await commRequest.post("/", data);
    if (response.status !== 200) {
      return false;
    }

    const { token, key } = response.data;
    if (!token || !key) {
      throw new Error("Invalid login response");
    }
    localStorage.setItem("token", token);
    localStorage.setItem("key", key);
  } catch (error) {
    console.error("Error logging in:", error);
    return false;
  }
  return true;
}

export async function userLogout(): Promise<boolean> {
  try {
    const token = getToken();
    const response = await JSONRequest.post("/logout", {
      token: token,
    });

    const decryptedData = decryptResponse(response);
    console.log("Logout response:", decryptedData);

    localStorage.removeItem("token");
    localStorage.removeItem("key");
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
  return true;
}

export async function getWifi(): Promise<{ ssid: string }> {
  try {
    const response = await JSONRequest.post("/getWifi", {});
    if (response.status !== 200) {
      throw new Error("Failed to fetch WiFi information");
    }
    const decryptedData = decryptResponse(response);
    const ssid = decryptedData.ssid;
    if (!ssid) {
      throw new Error("SSID not found in response");
    }
    return { ssid };
  } catch (error) {
    console.error("Error fetching WiFi information:", error);
  }
  return { ssid: "unknown" };
}

export async function getUser(): Promise<{ username: string }> {
  try {
    const response = await JSONRequest.post("/getUser", {});
    if (response.status !== 200) {
      throw new Error("Failed to fetch user information");
    }

    const decryptedData = decryptResponse(response);
    const username = decryptedData.username;
    if (!username) {
      throw new Error("Username not found in response");
    }
    return { username };
  } catch (error) {
    console.error("Error fetching user information:", error);
  }
  return { username: "unknown" };
}

export async function setWifi(ssid: string, password: string): Promise<boolean> {
  try {
    const response = await JSONRequest.post("/setWifi", {
      ssid: ssid,
      password: password,
    });
    if (response.status !== 200) {
      throw new Error("Failed to set WiFi configuration");
    }
    return true;
  } catch (error) {
    console.error("Error setting WiFi configuration:", error);
  }
  return false;
}

export async function setUser(username: string, password: string): Promise<boolean> {
  try {
    const response = await JSONRequest.post("/setUser", {
      username: username,
      password: password,
    });
    if (response.status !== 200) {
      throw new Error("Failed to set user configuration");
    }
    return true;
  } catch (error) {
    console.error("Error setting user configuration:", error);
  }
  return false;
}

export async function getSensorData(): Promise<sensorData | null> {
  try {
    console.log("Fetching sensor data...");
    const response = await JSONRequest.post("/sensor", { helo: 1 });
    console.log(response);
    if (response.status === 401) {
      route("/");
      // throw new Error("Invalid");
    }
    if (response.status !== 200) {
      // throw new Error("Failed to fetch sensor data");
    }
    const decryptedData = decryptResponse(response);
    console.log("Decrypted sensor data:", decryptedData);
    if (!decryptedData) {
      // throw new Error("Invalid sensor data format");
    }

    return decryptedData;
  } catch (error) {
    if (typeof error === "object" && error !== null && "status" in error && (error as any).status === 401) {
      route("/");
      return null;
    }
    console.error("Error fetching sensor data:", error);
  }
  return null;
}

export async function changeUserInfo(username: string, password: string): Promise<[string, boolean]> {
  try {
    const response = await JSONRequest.post("/changeUser", {
      username: username,
      password: password,
    });
    console.log("Change user response status:", response.status);
    if (response.status !== 200) {
      console.log("Failed to change user information");
      return ["Failed to change user information", false];
    }

    const decryptedData = decryptResponse(response);
    console.log("Change user response:", decryptedData);
    if (decryptedData.error !== undefined) {
      console.log("Error changing user information:", decryptedData.error);
      return [decryptedData.error, false];
    }

    if (decryptedData.message) {
      console.log("User information changed successfully:", decryptedData.message);
      return [decryptedData.message, true];
    }

    return ["Failed to change user information", false];
  } catch (error) {
    let decryptedData: any = {};
    if (typeof error === "object" && error !== null && "response" in error) {
      decryptedData = decryptResponse((error as any).response);
    }
    return [decryptedData.error || "An error occurred while changing user information", false];
  }
}

export async function changeWifiInfo(ssid: string, password: string): Promise<[string, boolean]> {
  try {
    const response = await JSONRequest.post("/changeWifi", {
      ssid: ssid,
      password: password,
    });
    console.log("Change WiFi response status:", response.status);
    if (response.status !== 200) {
      console.log("Failed to change WiFi information");
      return ["Failed to change WiFi information", false];
    }

    const decryptedData = decryptResponse(response);
    console.log("Change WiFi response:", decryptedData);
    if (decryptedData.error !== undefined) {
      console.log("Error changing WiFi information:", decryptedData.error);
      return [decryptedData.error, false];
    }

    if (decryptedData.message) {
      console.log("WiFi information changed successfully:", decryptedData.message);
      return [decryptedData.message, true];
    }

    return ["Failed to change WiFi information", false];
  } catch (error) {
    let decryptedData: any = {};
    if (typeof error === "object" && error !== null && "response" in error) {
      decryptedData = decryptResponse((error as any).response);
    }
    return [decryptedData.error || "An error occurred while changing WiFi information", false];
  }
}
