/**
 * Xavfsizlik testlari — bazasiz ishlaydi: `npm test`
 * Har bir test ilgari topilgan aniq teshikni qayta ochilmasligini tekshiradi.
 */
process.env.JWT_SECRET = "test-secret-0123456789-abcdefghijklmnop";
process.env.CLICK_SECRET_KEY = "click-secret";
process.env.PAYME_ID = "merchant1";
process.env.PAYME_PROD_KEY = "prod-key";
process.env.PAYME_TEST_KEY = "test-key";
process.env.PAYNET_USERNAME = "paynet";
process.env.PAYNET_PASSWORD = "p@ss:word";
process.env.BOT_API_SECRET = "b".repeat(40);

import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import md5 from "md5";

const { signPhoneProof, checkPhoneProof } = await import("../src/utils/phoneProof.util.js");
const { safeEqual } = await import("../src/utils/safeEqual.util.js");
const { checkSignatureToken } = await import("../src/utils/click.unit.js");
const { userAuth, factoryAuth } = await import("../src/middleware/auth.middleware.js");
const { paymeMiddleware } = await import("../src/middleware/payme.middleware.js");
const { basicAuth: paynetAuth } = await import("../src/middleware/paynet.middleware.js");
const { checkBotSecret } = await import("../src/middleware/security.middleware.js");
const { reviewOrderValidator } = await import("../src/validators/order.validator.js");
const { loginSchema, registerSchema } = await import("../src/validators/auth.validator.js");

const SECRET = process.env.JWT_SECRET!;

/** Express middleware'ni soxta req/res bilan ishga tushiradi */
function run(mw: any, req: any): Promise<{ next: boolean; status?: number; err?: any; req: any }> {
  return new Promise((resolve) => {
    const res: any = {
      statusCode: 200,
      status(c: number) { this.statusCode = c; return this; },
      json() { resolve({ next: false, status: this.statusCode, req }); return this; },
      sendStatus(c: number) { resolve({ next: false, status: c, req }); return this; },
    };
    req.headers ??= {};
    req.body ??= {};
    mw(req, res, (err?: any) => resolve({ next: !err, err, req }));
  });
}
const bearer = (payload: object, opts: jwt.SignOptions = {}) => ({ authorization: `Bearer ${jwt.sign(payload, SECRET, opts)}` });

// ── 1. SMS'siz login ───────────────────────────────────────────────
test("login/register SMS tasdig'isiz o'tmaydi", () => {
  assert.ok(loginSchema.validate({ phone: "+998901234567" }).error, "verifyToken majburiy");
  assert.ok(registerSchema.validate({ name: "a", lastName: "b", phone: "1", gender: "male" }).error);
});

test("telefon tasdig'i faqat o'sha raqam uchun ishlaydi", () => {
  const t = signPhoneProof("+998 90 123-45-67");
  assert.equal(checkPhoneProof(t, "+998901234567"), true);
  assert.equal(checkPhoneProof(t, "+998901234568"), false, "boshqa raqam");
  assert.equal(checkPhoneProof(undefined, "+998901234567"), false);
  // oddiy mijoz tokeni tasdiq o'rnida ishlamaydi
  const userToken = jwt.sign({ id: "u1", phone: "998901234567" }, SECRET);
  assert.equal(checkPhoneProof(userToken, "+998901234567"), false);
  // muddati o'tgan tasdiq
  const old = jwt.sign({ phone: "998901234567", purpose: "phone-verified" }, SECRET, { expiresIn: -10 });
  assert.equal(checkPhoneProof(old, "+998901234567"), false);
});

// ── 2. Rollar aralashmasligi ──────────────────────────────────────
test("userAuth: faqat mijoz tokeni", async () => {
  assert.equal((await run(userAuth, { headers: bearer({ id: "uuid-1" }) })).next, true);
  assert.equal((await run(userAuth, { headers: bearer({ id: 1 }) })).status, 401, "admin tokeni");
  assert.equal((await run(userAuth, { headers: bearer({ id: 3, role: "factory" }) })).status, 401, "fabrika tokeni");
  assert.equal((await run(userAuth, { headers: { authorization: "Bearer " + jwt.sign({ id: "u" }, "boshqa") } })).status, 401);
});

test("factoryAuth: faqat fabrika tokeni", async () => {
  const ok = await run(factoryAuth, { headers: bearer({ id: 3, role: "factory" }) });
  assert.equal(ok.next, true);
  assert.equal(ok.req.factoryId, 3);
  assert.equal((await run(factoryAuth, { headers: bearer({ id: 3 }) })).status, 401, "admin tokeni");
  assert.equal((await run(factoryAuth, { headers: bearer({ id: "uuid" }) })).status, 401, "mijoz tokeni");
});

// ── 3. To'lov tizimlari ───────────────────────────────────────────
test("Click imzosi", () => {
  const p = { click_trans_id: "1", service_id: "2", order_id: "3", merchant_prepare_id: "", amount: "1000", action: "0", sign_time: "t" };
  const good = md5(`1${"2"}click-secret3${""}10000t`);
  assert.equal(checkSignatureToken(good, p as any), true);
  assert.equal(checkSignatureToken(md5("soxta"), p as any), false);
  assert.equal(checkSignatureToken(good, { ...p, amount: "1" } as any), false, "summa o'zgartirilsa");
});

test("Payme avtorizatsiyasi", async () => {
  const b = (s: string) => ({ authorization: "Basic " + Buffer.from(s).toString("base64") });
  assert.equal((await run(paymeMiddleware, { headers: b("Paycom:prod-key"), body: { id: 1 } })).next, true);
  assert.equal((await run(paymeMiddleware, { headers: b("merchant1:test-key"), body: { id: 1 } })).next, true);
  const bad = await run(paymeMiddleware, { headers: b("Paycom:wrong"), body: { id: 1 } });
  assert.equal(bad.next, false);
  assert.ok(bad.err, "TransactionError qaytadi");
  assert.equal((await run(paymeMiddleware, { headers: {}, body: { id: 1 } })).next, false);
});

test("Paynet: IP ro'yxati va parol", async () => {
  const b = (s: string) => ({ authorization: "Basic " + Buffer.from(s).toString("base64") });
  const okIp = "213.230.106.113";
  assert.equal((await run(paynetAuth, { ip: okIp, headers: b("paynet:p@ss:word") })).next, true, "':' li parol");
  assert.equal((await run(paynetAuth, { ip: okIp, headers: b("paynet:wrong") })).status, 401);
  assert.equal((await run(paynetAuth, { ip: "1.2.3.4", headers: b("paynet:p@ss:word") })).status, 403);
});

test("bot kaliti", async () => {
  assert.equal((await run(checkBotSecret, { headers: { "x-bot-secret": "b".repeat(40) } })).next, true);
  assert.equal((await run(checkBotSecret, { headers: { "x-bot-secret": "b".repeat(39) + "c" } })).status, 401);
  assert.equal((await run(checkBotSecret, { headers: {} })).status, 401);
});

test("solishtirish uzunlik farqida yiqilmaydi", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abcd"), false);
});

// ── 4. Buyurtma summasini buzish ──────────────────────────────────
test("buyurtmada manfiy/kasr miqdor o'tmaydi", () => {
  const branch = { code: "1", name: "n", regionCode: "1", cityCode: "1", address: "a", lat_long: "1,1", phone: "1" };
  const base = { total_price: 1, selectedBranch: branch };
  const item = (q: number) => ({ items: [{ productId: 1, quantity: q, colorId: 1, sizeId: 1 }], ...base });
  assert.equal(reviewOrderValidator.validate(item(2)).error, undefined);
  for (const q of [-1, 0, 1.5, 1000]) assert.ok(reviewOrderValidator.validate(item(q)).error, `quantity=${q}`);
  assert.ok(reviewOrderValidator.validate({ items: [], ...base }).error, "bo'sh savat");
});

test("CIDR tekshiruvi", async () => {
  const { isIpInCidrs } = await import("../src/utils/ip.util.js");
  const L = ["213.230.106.112/28", "91.196.76.52"];
  assert.equal(isIpInCidrs("213.230.106.112", L), true);
  assert.equal(isIpInCidrs("213.230.106.127", L), true);
  assert.equal(isIpInCidrs("213.230.106.128", L), false);
  assert.equal(isIpInCidrs("::ffff:91.196.76.52", L), true);
  assert.equal(isIpInCidrs("91.196.76.53", L), false);
  assert.equal(isIpInCidrs("soxta", L), false);
});
