import { appendFile } from "node:fs/promises";

interface ParsedUrl {
  protocol: string;
  config: string;
  country:string;
}
interface IPApiResponse {
  status: string;
  country: string;
  message?: string; // Optional, in case of an error
}
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
async function fetchHtml(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html: string = await response.text();

    const regex = /(vless|vmess|wireguard|trojan|ss):\/\/[^\s<>]+/gm;
    const matches = html.match(regex);

    if (matches) {
      const lastFiveMessages = matches.slice(-5);

      lastFiveMessages.forEach((div, _) => {
          Grouping(div);
      });
    } else {
      console.log("No matches found.");
    }
  } catch (error) {
    console.error("Error fetching HTML:", error);
  }
}
async function vmessHandle(input:string) {
    const configinfo = JSON.parse(atob(input));
   const { flag  , country} = await checkIP(configinfo.add);
    configinfo.ps = configinfo.add;

    return { conf: btoa(JSON.stringify(configinfo)), country: country };
}
async function configChanger(urlString: string): Promise<ParsedUrl> {
  const protocol = urlString.split("://")[0]+"";
  let config,ipInfo;

  if (protocol == "vmess") {

    const vmesconf = await vmessHandle(urlString.split("://")[1] + "");
    config = "vmess://" + vmesconf.conf;
    ipInfo = vmesconf.country;
}
else{
    let hostname = new URL(urlString).hostname; 

    const {flag , country} = await checkIP(hostname);
    ipInfo = country;

    config = urlString.split("#")[0] + "#" + flag + " " + hostname;
  }
  return {
    protocol,
    config: config,
    country: ipInfo,
  };
}
async function checkIP(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = (await response.json()) as IPApiResponse;

    if (data.status === "fail") {
      console.log(`Error fetching data for IP ${ip}: ${data.message}`);
    }

    const country = data.country;
    const flag = countryFlagMap[country] || "🏳️";

    return { country: country, flag: flag };
  } catch (error) {
    console.log(
      error instanceof Error ? error.message : "An unknown error occurred."
    );
  }
  return { country: "", flag: "🏳️" };
}
async function Grouping(urls: string): Promise<void> {
  const parsedUrl = await configChanger(urls);
// await appendFile(`${parsedUrl.protocol}.txt`, parsedUrl.config + '\n');
//await appendFile(`${parsedUrl.country}.txt`, parsedUrl.config + "\n");
//await appendFile(`${parsedUrl.}.txt`, parsedUrl.config + "\n");
}
// Replace with your desired URL
const url: string = "https://t.me/s/mrsoulb";
fetchHtml(url);

