export const isIpInCidrs = (ip: string, paynetIPs: string[]) => {
    return paynetIPs.includes(ip);
}