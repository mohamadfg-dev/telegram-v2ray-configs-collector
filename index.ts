import { appendFile, rm } from "node:fs/promises";
import channles from "./telegram_channels.json" assert { type: "json" };
import countryFlags from "./countryFlags";
//--------------------------------------------------------- Type & Interfaces
type Result = Record<"config" | "country" | "typeConfig", string>;
type FinalResult = Record<"protocol", string> & Result;

interface ApiResponse {
  country: string;
  query: string;
  countryCode: string;
}
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
      await appendFile(`./BadChannels.txt`,`Bad Response: ${url} \n`);
      console.log(`Bad Response: ${url}`);
    }
    const html: string = await response.text();

    const regex = /(vless|vmess|wireguard|trojan|ss):\/\/[^\s<>]+/gm;
    const matches = html.match(regex);

    if (matches) {

      // Receive any number of configurations from any channel
      const lastFiveMessages = matches.slice(-2);

      for (const element of lastFiveMessages) {
        const decodeHtml = decodeHtmlEntities(element);

        if (!decodeHtml.includes("…")) {
          await Grouping(decodeHtml);
        } else {
          await appendFile(`./BadChannels.txt`,`Bad Configs: ${url} \n`);
        }

      }
    } else {
      await appendFile(`./BadChannels.txt`,`Not Match: ${url} \n`);
      console.log(`Not Match: ${url} \n`);
    }
  } catch (error) {
    await appendFile(`./BadChannels.txt`,`Other Error: ${url} \n`);
    console.log(`Other Error: ${url} \n`);
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
  let config, country, typeConfig="tcp";

  if (protocol == "vmess") {
    const vmesconf = await vmessHandle(urlString.split("://")[1] + "");

    config = "vmess://" + vmesconf.config;
    country = vmesconf.country;
    typeConfig = vmesconf.typeConfig;
  }
  else {
    const { hostname, searchParams } = new URL(urlString);

    const api = await checkIP(hostname);

    const typeParam = searchParams.get("type");
    if (typeParam && ["tcp","ws","http","grpc","quic","httpupgrade"].includes(typeParam)) {
      typeConfig = typeParam; 
    }
    country = api.country;
    // Change Name Config
    config = urlString.split("#")[0] + "#" + `${api.flag} ${api.countryCode} | ${api.ip}`;
  }
  return { protocol, config, country, typeConfig };
}
async function checkIP(ipaddress: string) {
  console.log("Check Ip ...");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let data: Partial<ApiResponse> = {};

  try {
    const response = await fetch(`https://www.irjh.top/py/check/ip.php?ip=${ipaddress}`);

    if (!response.ok) {
      console.log(`API HTTP error! status: ${response.status}`);
    } else {
      data = (await response.json()) as ApiResponse;
    }
  } catch{ }

  const country = data.country ?? "Unknown";
  const countryCode = data.countryCode ?? "UN";
  const flag = countryFlags[countryCode];
  const ip = data.query ?? ipaddress;

  return { country, flag, ip, countryCode };
}
async function Grouping(urls: string): Promise<void> {
  console.log(`Config : ${urls} \n`);

  const FinalResult = await configChanger(urls);

  console.log("final Info :", FinalResult, "\n");

  if (FinalResult) {
    await appendFile(`./category/${FinalResult.protocol}.txt`,FinalResult.config + "\n");
    await appendFile(`./category/${FinalResult.country}.txt`,FinalResult.config + "\n");
    if (FinalResult.typeConfig) {
      await appendFile(`./category/${FinalResult.typeConfig}.txt`,FinalResult.config + "\n");
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