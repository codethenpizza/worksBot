import TelegramBot from 'node-telegram-bot-api';

// move dotenv in one place
import dotenv from 'dotenv'
dotenv.config({path: './.env'});

const IS_PRODUCTION = process.env.PRODUCTION || false;
const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 433;
const URL = process.env.APP_URL || 'https://myworkbot.herokuapp.com ';

interface botOptions {
    polling: boolean,
    port?: number | string
}


const getBot = async (): Promise<TelegramBot> => {
    // general options
    const botOptions: botOptions = {
        polling: true,
    }
    try {
        if (!IS_PRODUCTION) {
            return new TelegramBot(TOKEN!, botOptions);
        }
        botOptions.port = PORT;
        const bot: TelegramBot = new TelegramBot(TOKEN!, botOptions);
        await bot.setWebHook(`${URL}/bot${TOKEN}`);

        console.log('URL - ', URL, 'PORT - ', PORT);
        return bot;
    } catch (e) {
        console.error(e)
        process.exit(1);
    }
}

export default getBot();