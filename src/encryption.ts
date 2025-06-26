import * as CryptoJS from "crypto-js";

export interface EncryptedData {
  cipher: string; // Hasil enkripsi dalam base64
  iv: string; // IV dalam base64
}
export const generateRandomIv = (): Uint8Array => {
  const iv = CryptoJS.lib.WordArray.random(16); // AES-128 membutuhkan IV 16 byte
  // Convert WordArray to Uint8Array
  const words = iv.words;
  const sigBytes = iv.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
};

export const generateRandomKey = (): Uint8Array => {
  const key = CryptoJS.lib.WordArray.random(16); // AES-128 membutuhkan kunci 16 byte
  // Convert WordArray to Uint8Array
  const words = key.words;
  const sigBytes = key.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return u8;
};

// Konversi Uint8Array ke base64
export const toBase64 = (bytes: Uint8Array): string => {
  // Convert to string first (from byte array)
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
};

// Validasi panjang & konversi ke base64
export const generateBase64Key = (key: Uint8Array): string => {
  if (key.length !== 16) {
    throw new Error("Key must be 16 bytes long for AES-128");
  }
  return toBase64(key);
};

export const generateBase64Iv = (iv: Uint8Array): string => {
  if (iv.length !== 16) {
    throw new Error("IV must be 16 bytes long for AES-128");
  }
  return toBase64(iv);
};

// encryption.ts

/**
 * Enkripsi AES-128-CBC
 * @param plainText - Teks asli
 * @param keyBase64 - Kunci dalam base64 (16 byte)
 * @param ivBase64 - IV dalam base64 (16 byte)
 */
export const encrypt = (plainText: string, keyBase64: string, ivBase64: string): string => {
  const key = CryptoJS.enc.Base64.parse(keyBase64);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // hasil dalam base64
};

/**
 * Dekripsi AES-128-CBC
 * @param encryptedBase64 - Hasil terenkripsi (base64)
 * @param keyBase64 - Kunci base64
 * @param ivBase64 - IV base64
 */
export const decrypt = (encryptedBase64: string, keyBase64: string, ivBase64: string): string => {
  const key = CryptoJS.enc.Base64.parse(keyBase64);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptJson = (data: Object, key: string): EncryptedData => {
  const iv = generateBase64Iv(generateRandomIv());
  const jsonString = JSON.stringify(data);
  const encrypted = encrypt(jsonString, key, iv);
  const encryptedData: EncryptedData = {
    cipher: encrypted,
    iv: iv,
  };

  return encryptedData;
};

export const decryptJson = (encryptedData: EncryptedData, key: string): Object => {
  const decrypted = decrypt(encryptedData.cipher, key, encryptedData.iv);
  const jsonData = JSON.parse(decrypted);
  return jsonData;
};
