import { appendFile, rm } from "node:fs/promises";
import channles from "./telegram_channels.json" assert { type: "json" };
//--------------------------------------------------------- Type & Interfaces
type Result = Record<"config" | "country" | "typeConfig", string>;
type FinalResult = Record<"protocol", string> & Result;

interface IPApiResponse {
  country: string;
  query: string;
  countryCode: string;
}
//---------------------------------------------------------- Variable
const countGetConfigOfEveryChannel = 2;
const countryFlagMap: { [key: string]: string } = {
  AF: "🇦🇫",
  AL: "🇦🇱",
  DZ: "🇩🇿",
  AD: "🇦🇩",
  AO: "🇦🇴",
  AG: "🇦🇬",
  AR: "🇦🇷",
  AM: "🇦🇲",
  AU: "🇦🇺",
  AT: "🇦🇹",
  AZ: "🇦🇿",
  BS: "🇧🇸",
  BH: "🇧🇭",
  BD: "🇧🇩",
  BB: "🇧🇧",
  BY: "🇧🇾",
  BE: "🇧🇪",
  BZ: "🇧🇿",
  BJ: "🇧🇯",
  BT: "🇧🇹",
  BO: "🇧🇴",
  BA: "🇧🇦",
  BW: "🇧🇼",
  BR: "🇧🇷",
  BN: "🇧🇳",
  BG: "🇧🇬",
  BF: "🇧🇫",
  BI: "🇧🇮",
  CV: "🇨🇻",
  KH: "🇰🇭",
  CM: "🇨🇲",
  CA: "🇨🇦",
  CF: "🇨🇫",
  TD: "🇹🇩",
  CL: "🇨🇱",
  CN: "🇨🇳",
  CO: "🇨🇴",
  KM: "🇰🇲",
  CG: "🇨🇬",
  CR: "🇨🇷",
  HR: "🇭🇷",
  CU: "🇨🇺",
  CY: "🇨🇾",
  CZ: "🇨🇿",
  CD: "🇨🇩",
  DK: "🇩🇰",
  DJ: "🇩🇯",
  DM: "🇩🇲",
  DO: "🇩🇴",
  EC: "🇪🇨",
  EG: "🇪🇬",
  SV: "🇸🇻",
  GQ: "🇬🇶",
  ER: "🇪🇷",
  EE: "🇪🇪",
  SZ: "🇸🇿",
  ET: "🇪🇹",
  FJ: "🇫🇯",
  FI: "🇫🇮",
  FR: "🇫🇷",
  GA: "🇬🇦",
  GM: "🇬🇲",
  GE: "🇬🇪",
  DE: "🇩🇪",
  GH: "🇬🇭",
  GR: "🇬🇷",
  GD: "🇬🇩",
  GT: "🇬🇹",
  GN: "🇬🇳",
  GW: "🇬🇼",
  GY: "🇬🇾",
  HT: "🇭🇹",
  HN: "🇭🇳",
  HU: "🇭🇺",
  IS: "🇮🇸",
  IN: "🇮🇳",
  ID: "🇮🇩",
  IR: "🇮🇷",
  IQ: "🇮🇶",
  IE: "🇮🇪",
  IL: "🇮🇱",
  IT: "🇮🇹",
  JM: "🇯🇲",
  JP: "🇯🇵",
  JO: "🇯🇴",
  KZ: "🇰🇿",
  KE: "🇰🇪",
  KI: "🇰🇮",
  KW: "🇰🇼",
  KG: "🇰🇬",
  LA: "🇱🇦",
  LV: "🇱🇻",
  LB: "🇱🇧",
  LS: "🇱🇸",
  LR: "🇱🇷",
  LY: "🇱🇾",
  LI: "🇱🇮",
  LT: "🇱🇹",
  LU: "🇱🇺",
  MG: "🇲🇬",
  MW: "🇲🇼",
  MY: "🇲🇾",
  MV: "🇲🇻",
  ML: "🇲🇱",
  MT: "🇲🇹",
  MH: "🇲🇭",
  MR: "🇲🇷",
  MU: "🇲🇺",
  MX: "🇲🇽",
  FM: "🇫🇲",
  MD: "🇲🇩",
  MC: "🇲🇨",
  MN: "🇲🇳",
  ME: "🇲🇪",
  MA: "🇲🇦",
  MZ: "🇲🇿",
  MM: "🇲🇲",
  NA: "🇳🇦",
  NR: "🇳🇷",
  NP: "🇳🇵",
  NL: "🇳🇱",
  NZ: "🇳🇿",
  NI: "🇳🇮",
  NE: "🇳🇪",
  NG: "🇳🇬",
  KP: "🇰🇵",
  MK: "🇲🇰",
  NO: "🇳🇴",
  OM: "🇴🇲",
  PK: "🇵🇰",
  PW: "🇵🇼",
  PS: "🇵🇸",
  PA: "🇵🇦",
  PG: "🇵🇬",
  PY: "🇵🇾",
  PE: "🇵🇪",
  PH: "🇵🇭",
  PL: "🇵🇱",
  PT: "🇵🇹",
  QA: "🇶🇦",
  RO: "🇷🇴",
  RU: "🇷🇺",
  RW: "🇷🇼",
  KN: "🇰🇳",
  LC: "🇱🇨",
  VC: "🇻🇨",
  WS: "🇼🇸",
  SM: "🇸🇲",
  ST: "🇸🇹",
  SA: "🇸🇦",
  SN: "🇸🇳",
  RS: "🇷🇸",
  SC: "🇸🇨",
  SL: "🇸🇱",
  SG: "🇸🇬",
  SK: "🇸🇰",
  SI: "🇸🇮",
  SB: "🇸🇧",
  SO: "🇸🇴",
  ZA: "🇿🇦",
  KR: "🇰🇷",
  SS: "🇸🇸",
  ES: "🇪🇸",
  LK: "🇱🇰",
  SD: "🇸🇩",
  SR: "🇸🇷",
  SE: "🇸🇪",
  CH: "🇨🇭",
  SY: "🇸🇾",
  TW: "🇹🇼",
  TJ: "🇹🇯",
  TZ: "🇹🇿",
  TH: "🇹🇭",
  TL: "🇹🇱",
  TG: "🇹🇬",
  TO: "🇹🇴",
  TT: "🇹🇹",
  TN: "🇹🇳",
  TR: "🇹🇷",
  TM: "🇹🇲",
  TV: "🇹🇻",
  UG: "🇺🇬",
  UA: "🇺🇦",
  AE: "🇦🇪",
  GB: "🇬🇧",
  US: "🇺🇸",
  UY: "🇺🇾",
  UZ: "🇺🇿",
  VU: "🇻🇺",
  VA: "🇻🇦",
  VE: "🇻🇪",
  VN: "🇻🇳",
  YE: "🇾🇪",
  ZM: "🇿🇲",
  ZW: "🇿🇼",
  UN: "🏴‍☠️"
};

//---------------------------------------------------------- Tools
function decodeHtmlEntities(str: string): string {
  return decodeURIComponent(str)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
function encodeBase64Unicode(obj: any): string {
  const json = JSON.stringify(obj);
  const uint8array = new TextEncoder().encode(json);
  return btoa(String.fromCharCode(...uint8array));
}
function decodeBase64Unicode(str: string): any {
  const binaryString = atob(str);
  const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}
//---------------------------------------------------------- Functions
async function fetchHtml(url: string): Promise<void> {
  try {
    const response = await fetch(url, { redirect: "manual" });
    if (!response.ok) {
      //    throw new Error(`HTTP error! status: ${response.status}`);
      await appendFile(`./BadChannels.txt`, url + "\n");
      console.log(url);
    }
    const html: string = await response.text();

    const regex = /(vless|vmess|wireguard|trojan|ss):\/\/[^\s<>]+/gm;
    const matches = html.match(regex);

    if (matches) {
      const lastFiveMessages = matches.slice(-countGetConfigOfEveryChannel);

      for (const element of lastFiveMessages) {
        const decodeHtml = decodeHtmlEntities(element);

        if (!decodeHtml.includes("…")) {
          await Grouping(decodeHtml);
        } else {
          await appendFile(`./BadChannels.txt`, url + "\n");
        }

      }
    } else {
      await appendFile(`./BadChannels.txt`, url + "\n");
      console.log(url);
    }
  } catch (error) {
    await appendFile(`./BadChannels.txt`, url + "\n");
    console.log(url);
    //  console.log("Error fetching HTML:", error);
  }
}
async function vmessHandle(input: string): Promise<Result> {
  const configinfo = decodeBase64Unicode(input);

  const { flag, country, ip , countryCode } = await checkIP(configinfo.add);
  configinfo.ps = `${flag} ${countryCode} | ${ip}`;

  return {
    config: encodeBase64Unicode(configinfo),
    country: country,
    typeConfig: configinfo.net,
  };
}
async function configChanger(urlString: string): Promise<FinalResult> {
  const protocol = urlString.split("://")[0] + "";
  let config, country, typeConfig;

  if (protocol == "vmess") {
    const vmesconf = await vmessHandle(urlString.split("://")[1] + "");

    config = "vmess://" + vmesconf.config;
    country = vmesconf.country;
    typeConfig = vmesconf.typeConfig;
  }
  else {
    const { hostname, searchParams } = new URL(urlString);

    const api = await checkIP(hostname);

    typeConfig = searchParams.get("type") ?? "";
    country = api.country;
    config = urlString.split("#")[0] + "#" + `${api.flag} ${api.countryCode} | ${api.ip}`;
  }
  return { protocol, config, country, typeConfig };
}
async function checkIP(ipaddress: string) {
  console.log("Check Ip ...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let data: Partial<IPApiResponse> = {};

  try {
    const response = await fetch(`https://www.irjh.top/py/check/ip.php?ip=${ipaddress}`);

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
    } else {
      data = (await response.json()) as IPApiResponse;
    }
  } catch{ }

  const country = data.country ?? "Unknown";
  const countryCode = data.countryCode ?? "UN";
  const flag = countryFlagMap[countryCode];
  const ip = data.query ?? ipaddress;

  return { country, flag, ip, countryCode };
}
async function Grouping(urls: string): Promise<void> {
  console.log("Config :", urls + "\n");

  const FinalResult = await configChanger(urls);

  console.log("final Info :", FinalResult, "\n");

  if (FinalResult) {
    await appendFile(
      `./category/${FinalResult.protocol}.txt`,
      FinalResult.config + "\n"
    );
    await appendFile(
      `./category/${FinalResult.country}.txt`,
      FinalResult.config + "\n"
    );
    if (FinalResult.typeConfig) {
      await appendFile(
        `./category/${FinalResult.typeConfig}.txt`,
        FinalResult.config + "\n"
      );
    }
  }
}
async function startScaninig() {
  for (const value of channles) {
    console.log("Start Get From :" + value);
    await fetchHtml("https://t.me/s/" + value);
  }
}
startScaninig();