// Node.js скрипт без TypeScript
const crypto = require('crypto');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('Set TELEGRAM_BOT_TOKEN in environment before running this script.');
  process.exit(1);
}

// Имитация user из Telegram
const user = {
  id: 999001,
  first_name: 'Dev',
  last_name: 'Tester',
  username: 'devtester',
  language_code: 'en',
};

const auth_date = Math.floor(Date.now() / 1000);
const pairs = [
  ['auth_date', String(auth_date)],
  ['user', JSON.stringify(user)],
];

const dataCheckString = pairs
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');

const key = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
const hash = crypto.createHmac('sha256', key).update(dataCheckString).digest('hex');

const params = new URLSearchParams();
for (const [k, v] of pairs) params.set(k, v);
params.set('hash', hash);

console.log(params.toString());
