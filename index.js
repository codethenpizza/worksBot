require('dotenv').config({path: __dirname + '/.env'});
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const options = {
    polling: true,
    port: process.env.PORT
}
const url = process.env.APP_URL;

const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`);

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(CHAT_ID, `chat id ${chatId}`)
});

if (CHAT_ID) {
    console.log('jobs set');

    cron.schedule('18 13 * * 1-5', async () => {
        console.log('send 18 13 * * 1-5');
        await getStatusInfo();
    })

    cron.schedule('30 21 * * 1-5', async () => {
        console.log('send 30 21 * * 1-5');
        await createPoll();
    })
}

bot.onText(/лол/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `кек`)
})

// cron events
const getStatusInfo = async () => {
    const status_time = '15:00'
    await bot.sendMessage(CHAT_ID, `Кирилл, будет статус в ${status_time}?`);
}

const createPoll = async () => {
    const question = 'Нужен созвон с Андреем?';
    const answers = ['Да', 'Нет'];
    const options = {
        is_anonymous: false,
        open_period: 30000,
    }

    await bot.sendPoll(CHAT_ID, question, answers, options);
}