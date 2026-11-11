const COLOR_NAMES: Record<string, string> = {
  ffffff: "Oq",
  fff: "Oq",
  f5f5f5: "Oq kulrang",
  eeeeee: "Oq kulrang",
  c0c0c0: "Kumushrang",
  "808080": "Kulrang",
  a9a9a9: "Kulrang",
  "696969": "To'q kulrang",
  "000000": "Qora",
  "000": "Qora",
  ff0000: "Qizil",
  f00: "Qizil",
  dc143c: "Qizil",
  e60000: "Qizil",
  c0392b: "Qizil",
  ff4500: "Qizg'ish to'q sariq",
  ffa500: "To'q sariq",
  ff8c00: "To'q sariq",
  ffc107: "Oltinrang",
  ffd700: "Oltinrang",
  ffff00: "Sariq",
  ff0: "Sariq",
  ffff33: "Sariq",
  ffe4b5: "Och bej",
  ffdab9: "Bej",
  d2b48c: "Jigarrang",
  "8b4513": "Jigarrang",
  a52a2a: "To'q jigarrang",
  "800000": "To'q qizil",
  ffc0cb: "Pushti",
  ffb6c1: "Pushti",
  ff69b4: "Och pushti",
  ff1493: "Yorqin pushti",
  e91e63: "Pushti",
  c71585: "To'q pushti",
  "800080": "Binafsha",
  "8b008b": "To'q binafsha",
  "9932cc": "Binafsha",
  "9b59b6": "Binafsha",
  ba55d3: "Och binafsha",
  ee82ee: "Och binafsha",
  "9400d3": "To'q binafsha",
  "4b0082": "Indigo",
  "6a0dad": "To'q binafsha",
  "0000ff": "Ko'k",
  "00f": "Ko'k",
  "0000cd": "To'q ko'k",
  "00008b": "To'q ko'k",
  "1e90ff": "Ko'k",
  "4169e1": "Ko'k",
  "4682b4": "Ko'k-kulrang",
  "87ceeb": "Och ko'k",
  add8e6: "Och ko'k",
  "00bfff": "Sian",
  "00ffff": "Sian",
  "0ff": "Sian",
  "40e0d0": "Turkuaz",
  "008080": "Turkuaz",
  "20b2aa": "Yashil-sian",
  "008000": "Yashil",
  "00ff00": "Yashil",
  "0f0": "Yashil",
  "228b22": "To'q yashil",
  "2e8b57": "Dengiz yashil",
  "32cd32": "Och yashil",
  "90ee90": "Och yashil",
  adff2f: "Yashil-sariq",
  "7fff00": "Yashil-sariq",
  "556b2f": "Zaytun",
  "808000": "Zaytun",
  f0e68c: "Xaki",
  bdb76b: "Xaki",
  c0c0ff: "Och ko'k",
};

export function isHexColor(value: string): boolean {
  return /^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/i.test(value.trim());
}

export function colorNameFromHex(value: string): string | null {
  let hex = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return COLOR_NAMES[hex] ?? null;
}

export function colorLabel(name: string): { swatch: string | null; label: string } {
  if (isHexColor(name)) {
    const hex = `#${name.trim().replace(/^#/, "").toLowerCase()}`;
    return { swatch: hex, label: colorNameFromHex(name) ?? name };
  }
  return { swatch: null, label: name };
}
