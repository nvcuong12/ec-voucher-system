import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

// Test DB connection before starting server
await testConnection();

app.listen(PORT, () => {
  console.log(`\n🚀 Voucher System API running on http://localhost:${PORT}`);
  console.log(`📄 Environment: ${process.env.NODE_ENV || "development"}\n`);
});
