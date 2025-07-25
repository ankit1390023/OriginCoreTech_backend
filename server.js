require('dotenv').config();
const app = require('./app');
const sequelize = require('./db');
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    //await sequelize.sync({ alter: true });
    console.log('✅ Database connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();
