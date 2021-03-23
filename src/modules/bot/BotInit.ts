import TelegramBot from 'node-telegram-bot-api';

// move dotenv in one place
import dotenv from 'dotenv'
import connectDB from "../../config/database";
import JobController from "../jobs/JobController";

dotenv.config({path: './.env'});

const IS_PRODUCTION = process.env.PRODUCTION;
const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 433;
const URL = process.env.APP_URL || 'https://myworkbot.herokuapp.com ';

interface botOptions {
    polling: boolean,
    port?: number | string
}

const initBot = async () => {
    // general options
    const botOptions: botOptions = {
        polling: true,
    }

    if (!IS_PRODUCTION) {
        return new TelegramBot(TOKEN!, botOptions);
    }
    botOptions.port = PORT;
    const bot: TelegramBot = new TelegramBot(TOKEN!, botOptions);
    await bot.setWebHook(`${URL}/bot${TOKEN}`, {allowed_updates: ['poll_answer']});
    return bot;
}


// functions that should be execute after bot created
const afterInit = async (bot: TelegramBot): Promise<void> => {
    await connectDB();
    await JobController.scheduleJobsForAllChats(bot);
}

const getBot = async (): Promise<TelegramBot> => {
    try {
        const bot = await initBot();
        await afterInit(bot);
        return bot
    } catch (e) {
        console.error(e)
        process.exit(1);
    }
}

export default getBot;