process.env.NTBA_FIX_319 = 1;

require('dotenv').config({path: __dirname + '/.env'});
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN;
const JOBS_CHAT_ID = process.env.CHAT_ID;
const STATUS_JOB_SCHEDULE = process.env.STATUS_JOB_SCHEDULE || '40 14 * * 1-5';
const CALLS_JOB_SCHEDULE = process.env.CALLS_JOB_SCHEDULE || '30 21 * * 1-5';
const PORT = process.env.PORT || 433;
const URL = process.env.APP_URL || 'https://myworkbot.herokuapp.com ';

const options = {
    polling: true,
    port: PORT,
}
console.log('URL - ', URL, 'PORT - ', PORT);
const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${URL}/bot${TOKEN}`)
    .then(() => {
        console.log('hook passed')
    })
    .catch(e => {
        console.error(e)
    }
)

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `chat id ${chatId}`)
});

bot.onText(/\/jobs/, async (msg) => {
    const chatId = msg.chat.id;

    if (JOBS_CHAT_ID) {
        await bot.sendMessage(chatId, `Статус - ${STATUS_JOB_SCHEDULE}, вечерний созвон - ${CALLS_JOB_SCHEDULE}`);
        return;
    }

    await bot.sendMessage(chatId, `Нет запланированных работ`);
})


if (JOBS_CHAT_ID) {
    console.log('jobs set');

    cron.schedule(STATUS_JOB_SCHEDULE, async () => {
        console.log('status start job', STATUS_JOB_SCHEDULE);
        try {
            await getStatusInfo();
        } catch (e) {
            console.error('status job error', e);
        }
    })

    cron.schedule(CALLS_JOB_SCHEDULE, async () => {
        console.log('calls start job', CALLS_JOB_SCHEDULE);
        try {
            await createPoll();
        } catch (e) {
            console.error('calls job error', e);
        }
    })
}

// short answers
bot.onText(/лол/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `кек`)
})
bot.onText(/\)\)\)\)/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `)))0)00`)
})

// cron events
const getStatusInfo = async () => {
    const status_time = '15:00'
    await bot.sendMessage(JOBS_CHAT_ID, `Кирилл, будет статус в ${status_time}?`);
}

const createPoll = async () => {
    const question = 'Нужен созвон с Андреем?';
    const answers = ['Да', 'Нет'];
    const options = {
        is_anonymous: false,
        open_period: 30000,
    }

    await bot.sendPoll(JOBS_CHAT_ID, question, answers, options);
}