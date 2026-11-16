/** IPv4 manzil CIDR ro'yxatidan biriga kiradimi ("1.2.3.4" yoki "1.2.3.0/28"). "::ffff:1.2.3.4" ham qabul qilinadi. */
const toInt = (ip: string): number | null => {
    const m = ip.trim().replace(/^::ffff:/i, "").match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return null;
    const parts = m.slice(1).map(Number);
    if (parts.some((p) => p > 255)) return null;
    return ((parts[0]! << 24) >>> 0) + (parts[1]! << 16) + (parts[2]! << 8) + parts[3]!;
};

export const isIpInCidrs = (ip: string, cidrs: string[]): boolean => {
    const addr = toInt(ip);
    if (addr === null) return false;
    return cidrs.some((c) => {
        const [base, bitsRaw] = c.split("/");
        const net = toInt(base ?? "");
        if (net === null) return false;
        const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
        if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;
        const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
        return ((addr & mask) >>> 0) === ((net & mask) >>> 0);
    });
};
