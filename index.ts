import { appendFile , rm} from "node:fs/promises";
import channles from "./telegram_channels.json" assert { type: "json" };
//---------------------------------------------------------
type ParsedUrl = Record<
  "protocol" | "config" | "ipInfo" | "typeConfig",
  string
>;
type vmessReturn = Record<"conf" | "country" | "typeconfig", string>;

interface CheckHostResponse {
  [key: string]: any; // برای سایر فیلدها
} 
interface IPApiResponse {
  status: string;
  country: string;
  query:string,
  message?: string; // Optional, in case of an error
}
const countGetConfigOfEveryChannel = 2;
//----------------------------------------------------------
const countryFlagMap: { [key: string]: string } = {
  Afghanistan: "🇦🇫",
  Albania: "🇦🇱",
  Algeria: "🇩🇿",
  Andorra: "🇦🇩",
  Angola: "🇦🇴",
  "Antigua and Barbuda": "🇦🇬",
  Argentina: "🇦🇷",
  Armenia: "🇦🇲",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Azerbaijan: "🇦🇿",
  Bahamas: "🇧🇸",
  Bahrain: "🇧🇭",
  Bangladesh: "🇧🇩",
  Barbados: "🇧🇧",
  Belarus: "🇧🇾",
  Belgium: "🇧🇪",
  Belize: "🇧🇿",
  Benin: "🇧🇯",
  Bhutan: "🇧🇹",
  Bolivia: "🇧🇴",
  "Bosnia and Herzegovina": "🇧🇦",
  Botswana: "🇧🇼",
  Brazil: "🇧🇷",
  Brunei: "🇧🇳",
  Bulgaria: "🇧🇬",
  "Burkina Faso": "🇧🇫",
  Burundi: "🇧🇮",
  "Cabo Verde": "🇨🇻",
  Cambodia: "🇰🇭",
  Cameroon: "🇨🇲",
  Canada: "🇨🇦",
  "Central African Republic": "🇨🇫",
  Chad: "🇹🇩",
  Chile: "🇨🇱",
  China: "🇨🇳",
  Colombia: "🇨🇴",
  Comoros: "🇰🇲",
  "Congo (Congo-Brazzaville)": "🇨🇬",
  "Costa Rica": "🇨🇷",
  Croatia: "🇭🇷",
  Cuba: "🇨🇺",
  Cyprus: "🇨🇾",
  "Czech Republic": "🇨🇿",
  "Democratic Republic of the Congo": "🇨🇩",
  Denmark: "🇩🇰",
  Djibouti: "🇩🇯",
  Dominica: "🇩🇲",
  "Dominican Republic": "🇩🇴",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  "El Salvador": "🇸🇻",
  "Equatorial Guinea": "🇬🇶",
  Eritrea: "🇪🇷",
  Estonia: "🇪🇪",
  Eswatini: "🇸🇿",
  Ethiopia: "🇪🇹",
  Fiji: "🇫🇯",
  Finland: "🇫🇮",
  France: "🇫🇷",
  Gabon: "🇬🇦",
  Gambia: "🇬🇲",
  Georgia: "🇬🇪",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Greece: "🇬🇷",
  Grenada: "🇬🇩",
  Guatemala: "🇬🇹",
  Guinea: "🇬🇳",
  "Guinea-Bissau": "🇬🇼",
  Guyana: "🇬🇾",
  Haiti: "🇭🇹",
  Honduras: "🇭🇳",
  Hungary: "🇭🇺",
  Iceland: "🇮🇸",
  India: "🇮🇳",
  Indonesia: "🇮🇩",
  Iran: "🇮🇷",
  Iraq: "🇮🇶",
  Ireland: "🇮🇪",
  Israel: "🇮🇱",
  Italy: "🇮🇹",
  Jamaica: "🇯🇲",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  Kazakhstan: "🇰🇿",
  Kenya: "🇰🇪",
  Kiribati: "🇰🇮",
  Kuwait: "🇰🇼",
  Kyrgyzstan: "🇰🇬",
  Laos: "🇱🇦",
  Latvia: "🇱🇻",
  Lebanon: "🇱🇧",
  Lesotho: "🇱🇸",
  Liberia: "🇱🇷",
  Libya: "🇱🇾",
  Liechtenstein: "🇱🇮",
  Lithuania: "🇱🇹",
  Luxembourg: "🇱🇺",
  Madagascar: "🇲🇬",
  Malawi: "🇲🇼",
  Malaysia: "🇲🇾",
  Maldives: "🇲🇻",
  Mali: "🇲🇱",
  Malta: "🇲🇹",
  "Marshall Islands": "🇲🇭",
  Mauritania: "🇲🇷",
  Mauritius: "🇲🇺",
  Mexico: "🇲🇽",
  Micronesia: "🇫🇲",
  Moldova: "🇲🇩",
  Monaco: "🇲🇨",
  Mongolia: "🇲🇳",
  Montenegro: "🇲🇪",
  Morocco: "🇲🇦",
  Mozambique: "🇲🇿",
  "Myanmar (Burma)": "🇲🇲",
  Namibia: "🇳🇦",
  Nauru: "🇳🇷",
  Nepal: "🇳🇵",
  Netherlands: "🇳🇱",
  "New Zealand": "🇳🇿",
  Nicaragua: "🇳🇮",
  Niger: "🇳🇪",
  Nigeria: "🇳🇬",
  "North Korea": "🇰🇵",
  "North Macedonia": "🇲🇰",
  Norway: "🇳🇴",
  Oman: "🇴🇲",
  Pakistan: "🇵🇰",
  Palau: "🇵🇼",
  Palestine: "🇵🇸",
  Panama: "🇵🇦",
  "Papua New Guinea": "🇵🇬",
  Paraguay: "🇵🇾",
  Peru: "🇵🇪",
  Philippines: "🇵🇭",
  Poland: "🇵🇱",
  Portugal: "🇵🇹",
  Qatar: "🇶🇦",
  Romania: "🇷🇴",
  Russia: "🇷🇺",
  Rwanda: "🇷🇼",
  "Saint Kitts and Nevis": "🇰🇳",
  "Saint Lucia": "🇱🇨",
  "Saint Vincent and the Grenadines": "🇻🇨",
  Samoa: "🇼🇸",
  "San Marino": "🇸🇲",
  "Sao Tome and Principe": "🇸🇹",
  "Saudi Arabia": "🇸🇦",
  Senegal: "🇸🇳",
  Serbia: "🇷🇸",
  Seychelles: "🇸🇨",
  "Sierra Leone": "🇸🇱",
  Singapore: "🇸🇬",
  Slovakia: "🇸🇰",
  Slovenia: "🇸🇮",
  "Solomon Islands": "🇸🇧",
  Somalia: "🇸🇴",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "South Sudan": "🇸🇸",
  Spain: "🇪🇸",
  "Sri Lanka": "🇱🇰",
  Sudan: "🇸🇩",
  Suriname: "🇸🇷",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Syria: "🇸🇾",
  Taiwan: "🇹🇼",
  Tajikistan: "🇹🇯",
  Tanzania: "🇹🇿",
  Thailand: "🇹🇭",
  "Timor-Leste": "🇹🇱",
  Togo: "🇹🇬",
  Tonga: "🇹🇴",
  "Trinidad and Tobago": "🇹🇹",
  Tunisia: "🇹🇳",
  Turkey: "🇹🇷",
  Turkmenistan: "🇹🇲",
  Tuvalu: "🇹🇻",
  Uganda: "🇺🇬",
  Ukraine: "🇺🇦",
  "United Arab Emirates": "🇦🇪",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  Uruguay: "🇺🇾",
  Uzbekistan: "🇺🇿",
  Vanuatu: "🇻🇺",
  "Vatican City": "🇻🇦",
  Venezuela: "🇻🇪",
  Vietnam: "🇻🇳",
  Yemen: "🇾🇪",
  Zambia: "🇿🇲",
  Zimbabwe: "🇿🇼",
};
//----------------------------------------------------------
async function fetchHtml(url: string): Promise<void> {
  try {
    const response = await fetch(url,{redirect:"manual"});
    if (!response.ok) {
      //    throw new Error(`HTTP error! status: ${response.status}`);
      console.log(url);
    }
    const html: string = await response.text();

    const regex = /(vless|vmess|wireguard|trojan|ss):\/\/[^\s<>]+/gm;
    const matches = html.match(regex);

    if (matches) {
      const lastFiveMessages = matches.slice(-countGetConfigOfEveryChannel);

   //   lastFiveMessages.forEach((div, _) => {

        for (const element of lastFiveMessages) {
          await Grouping(decodeHtmlEntities(element));
        }
     
    //  });
    } else {
   //   await appendFile(`./BadChannels.txt`, url + "\n");
      console.log(url);
    }
  } catch (error) {
    console.log(url);
  //  console.log("Error fetching HTML:", error);
  }
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
async function vmessHandle(input: string): Promise<vmessReturn | null> {
    const configinfo = decodeBase64Unicode(input);

    if (!await checkHostCheck(configinfo.add)) { return null;}

      const { flag, country , ip } = await checkIP(configinfo.add);
      configinfo.ps = `${flag} ${ip}`;

      return {
        conf: encodeBase64Unicode(configinfo),
        country: country,
        typeconfig: configinfo.net,
      };
}
async function configChanger(urlString: string): Promise<ParsedUrl | null> {
  const protocol = urlString.split("://")[0] + "";
  let config, ipInfo, typeConfig;

  if (protocol == "vmess") {
    const vmesconf = await vmessHandle(urlString.split("://")[1] + "");
    if (!vmesconf) { return null ;}
 
      config = "vmess://" + vmesconf.conf;
      ipInfo = vmesconf.country;
      typeConfig = vmesconf.typeconfig;
  } 
  else {
    const { hostname, searchParams } = new URL(urlString);

    if (!await checkHostCheck(hostname)) { return null;}

      const { flag, country, ip } = await checkIP(hostname);
      typeConfig = searchParams.get("type") ?? "";
      ipInfo = country;
      config = urlString.split("#")[0] + "#" + flag + " " + ip;
  }
  return { protocol, config, ipInfo, typeConfig };
}
async function checkIP(ipaddress: string) {

    const response = await fetch(`http://ip-api.com/json/${ipaddress}`,{redirect:"manual"});
    const data = (await response.json()) as IPApiResponse;

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
    }
    if (data.status === "fail") {
      console.log(`Error fetching data for IP ${ipaddress}: ${data.message}`);
    }

    const country = data.country || "Unknown";
    const flag = countryFlagMap[country] || "🏴‍☠️";
    const ip = data.query || "Unknown";

  return { country, flag, ip };
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function decodeHtmlEntities(str: string): string {
  return decodeURIComponent(str)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
async function checkHostApi(domain: string,field = ""): Promise<string | CheckHostResponse> {
  const response = await fetch(domain, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
   // throw new Error("Network response was not ok");
    console.log("Network response was not ok");
    
  }

  const data = (await response.json()) as { [key: string]: any };
  return data[field] || data; // برگرداندن فیلد مشخص شده یا کل داده‌ها
}
async function checkHostCheck(target: string): Promise<boolean> {
  let counter = 0,
    host = "ir5.node.check-host.net";
  const hash = await checkHostApi(
    `https://check-host.net/check-ping?host=${target}&node=${host}`,
    "request_id"
  );
 console.log("Checking IP ...  ");
  await sleep(20000); // یک ثانیه صبر کن
  const isps = (await checkHostApi(
    `https://check-host.net/check-result/${hash}`
  )) as { [key: string]: Array<Array<[string, number, string?]>> };

  if (isps[host] && isps[host][0]) {
    for (const [status, _] of isps[host][0]) {
      if (status != "TIMEOUT") {
        counter += 1;
      }
      /*
      if (counter >= 2) {
        break;
      }
        */
    }
  }
 // console.log("host : ", isps);
 // console.log("hash : ", hash);
  console.log("count host : ", counter);
  return counter >= 2;
}
async function Grouping(urls: string): Promise<void> {
  console.log("Config :",urls +"\n");
  
  const parsedUrl = await configChanger(urls);

  console.log("final Info :", parsedUrl,"\n");
  if (parsedUrl) {
    await appendFile(
      `./category/${parsedUrl.protocol}.txt`,
      parsedUrl.config + "\n"
    );
    await appendFile(
      `./category/${parsedUrl.ipInfo}.txt`,
      parsedUrl.config + "\n"
    );
    if (parsedUrl.typeConfig) {
      await appendFile(
        `./category/${parsedUrl.typeConfig}.txt`,
        parsedUrl.config + "\n"
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

//------------------------------------- Test Good OR Bad channels
/*
channles.forEach((value)=>{
  fetchHtml("https://t.me/s/"+value);
})
const filteredChannles = channles.filter(
  (channel) => !badchannles.includes(channel)
);
appendFile(`./ch.json`, JSON.stringify(filteredChannles));

*/

//await rm("./category", { recursive: true , force:true });



