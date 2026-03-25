
// =============================================================================
// coupons.js
// =============================================================================
const exCp = require("express");
const { authenticate: aCp, requireRole: rCp } = require("../middleware/auth");
const routerCp = exCp.Router();
routerCp.use(aCp);

// Verify a coupon (cashier can check validity, but NOT apply — enforced in orders)
routerCp.get("/validate/:code", async (req, res) => {
  try {
    const coupon = await req.prisma.coupon.findUnique({ where: { code: req.params.code.toUpperCase() } });
    if (!coupon || !coupon.isActive) return res.status(404).json({ valid: false, error: "Invalid coupon" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ valid: false, error: "Coupon expired" });
    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) return res.status(400).json({ valid: false, error: "Coupon limit reached" });
    res.json({ valid: true, discountPct: coupon.discountPct, code: coupon.code });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

routerCp.get("/", rCp(["manager", "admin"]), async (req, res) => {
  try { res.json(await req.prisma.coupon.findMany({ orderBy: { code: "asc" } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

routerCp.post("/", rCp("admin"), async (req, res) => {
  try {
    const { code, discountPct, maxUses, expiresAt } = req.body;
    if (!code || !discountPct) return res.status(400).json({ error: "code and discountPct required" });
    const coupon = await req.prisma.coupon.create({ data: { code: code.toUpperCase(), discountPct: +discountPct, maxUses: maxUses ? +maxUses : null, expiresAt: expiresAt ? new Date(expiresAt) : null } });
    res.status(201).json(coupon);
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Coupon code already exists" });
    res.status(500).json({ error: e.message });
  }
});

routerCp.patch("/:id", rCp("admin"), async (req, res) => {
  try {
    const coupon = await req.prisma.coupon.update({ where: { id: +req.params.id }, data: req.body });
    res.json(coupon);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = routerCp;


