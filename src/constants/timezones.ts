// src/constants/timezones.ts

export interface TimezoneOption {
  label: string;
  description: string;
  value: string;
  emoji: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // --- EUROPE ---
  {
    label: "Western Europe (UK, Portugal, Iceland)",
    description: "GMT / BST",
    value: "Europe/London",
    emoji: "🇬🇧",
  },
  {
    label: "Central Europe (Germany, France, Spain, Italy, Sweden...)",
    description: "CET / CEST",
    value: "Europe/Berlin",
    emoji: "🇪🇺",
  },
  {
    label: "Eastern Europe (Ukraine, Poland, Finland, Greece...)",
    description: "EET / EEST",
    value: "Europe/Kyiv",
    emoji: "🇺🇦",
  },
  {
    label: "Moscow / Turkey (Russia, Istanbul)",
    description: "MSK / TRT",
    value: "Europe/Moscow",
    emoji: "🇷🇺",
  },

  // --- NORTH AMERICA ---
  {
    label: "US Eastern / Canada East (New York, Toronto)",
    description: "EST / EDT",
    value: "America/New_York",
    emoji: "🇺🇸",
  },
  {
    label: "US Central / Mexico (Chicago, Dallas, Mexico City)",
    description: "CST / CDT",
    value: "America/Chicago",
    emoji: "🇺🇸",
  },
  {
    label: "US Mountain / Canada West (Denver, Calgary)",
    description: "MST / MDT",
    value: "America/Denver",
    emoji: "🇺🇸",
  },
  {
    label: "US Pacific / Canada West (Los Angeles, Vancouver)",
    description: "PST / PDT",
    value: "America/Los_Angeles",
    emoji: "🇺🇸",
  },
  {
    label: "Alaska (USA)",
    description: "AKST / AKDT",
    value: "America/Anchorage",
    emoji: "🇺🇸",
  },

  // --- ASIA ---
  {
    label: "East Asia (Japan, South Korea)",
    description: "JST / KST",
    value: "Asia/Tokyo",
    emoji: "🇯🇵",
  },
  {
    label: "East Asia (China, Singapore, Hong Kong)",
    description: "CST / SGT",
    value: "Asia/Shanghai",
    emoji: "🇨🇳",
  },
  {
    label: "Southeast Asia (Thailand, Vietnam, Indonesia...)",
    description: "ICT / WIB",
    value: "Asia/Bangkok",
    emoji: "🇹🇭",
  },
  {
    label: "South Asia (India, Sri Lanka)",
    description: "IST (UTC+5:30)",
    value: "Asia/Kolkata",
    emoji: "🇮🇳",
  },
  {
    label: "Middle East / UAE (Dubai, Saudi Arabia)",
    description: "GST / AST",
    value: "Asia/Dubai",
    emoji: "🇦🇪",
  },

  // --- OCEANIA ---
  {
    label: "Australia East (Sydney, Melbourne, Brisbane)",
    description: "AEST / AEDT",
    value: "Australia/Sydney",
    emoji: "🇦🇺",
  },
  {
    label: "Australia Central (Adelaide, Darwin)",
    description: "ACST / ACDT (UTC+9:30)",
    value: "Australia/Adelaide",
    emoji: "🇦🇺",
  },
  {
    label: "Australia West (Perth)",
    description: "AWST",
    value: "Australia/Perth",
    emoji: "🇦🇺",
  },
  {
    label: "New Zealand & Pacific (Auckland, Fiji)",
    description: "NZST / NZDT",
    value: "Pacific/Auckland",
    emoji: "🇳🇿",
  },

  // --- SOUTH AMERICA ---
  {
    label: "South America (São Paulo, Rio)",
    description: "BRT",
    value: "America/Sao_Paulo",
    emoji: "🇧🇷",
  },
  {
    label: "South America (Argentina, Chile, Peru...)",
    description: "ART / CLT",
    value: "America/Argentina/Buenos_Aires",
    emoji: "🇦🇷",
  },

  // --- AFRICA ---
  {
    label: "West Africa (Nigeria, Ghana, Cameroon...)",
    description: "WAT (UTC+1)",
    value: "Africa/Lagos",
    emoji: "🇳🇬",
  },
  {
    label: "Southern & Central Africa (South Africa, Zimbabwe...)",
    description: "SAST / CAT (UTC+2)",
    value: "Africa/Johannesburg",
    emoji: "🇿🇦",
  },
  {
    label: "East Africa (Kenya, Ethiopia, Tanzania...)",
    description: "EAT (UTC+3)",
    value: "Africa/Nairobi",
    emoji: "🇰🇪",
  },

  // --- FALLBACK ---
  {
    label: "Other Region / UTC Fallback",
    description: "Coordinated Universal Time",
    value: "UTC",
    emoji: "🌍",
  },
];
