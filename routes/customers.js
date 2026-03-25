
// =============================================================================
// customers.js
// =============================================================================
// backend/routes/customers.js
const exC = require("express");
const { authenticate: aC, requireRole: rC } = require("../middleware/auth");
const routerC = exC.Router();
routerC.use(aC, rC(["manager", "admin"]));

routerC.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {};
    const customers = await req.prisma.customer.findMany({ where, orderBy: { name: "asc" } });
    res.json(customers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

routerC.get("/:id", async (req, res) => {
  try {
    const customer = await req.prisma.customer.findUnique({
      where: { id: +req.params.id },
      include: { orders: { orderBy: { createdAt: "desc" }, take: 10, include: { orderItems: { include: { product: { select: { name: true, emoji: true } } } } } } },
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

routerC.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const customer = await req.prisma.customer.create({ data: { name, email, phone } });
    res.status(201).json(customer);
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Email already registered" });
    res.status(500).json({ error: e.message });
  }
});

routerC.patch("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await req.prisma.customer.update({ where: { id: +req.params.id }, data: { name, email, phone } });
    res.json(customer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

routerC.delete("/:id", rC("admin"), async (req, res) => {
  try {
    await req.prisma.customer.delete({ where: { id: +req.params.id } });
    res.json({ message: "Customer deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = routerC;

