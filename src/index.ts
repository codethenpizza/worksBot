process.env.NTBA_FIX_319 = String(1); // fix err
import dotenv from 'dotenv'

dotenv.config({path: './.env'});

import TelegramBot from "node-telegram-bot-api";
import getBot from './modules/bot/BotInit';
import BotController from "./modules/bot/BotController";

const main = async () => {
    const bot: TelegramBot = await getBot();
    const botController = new BotController(bot);

    /* General commands */
    bot.onText(/\/marco/, async (msg) => {
        await botController.ping(msg)
    });

    /* Jobs */
    bot.onText(/\/jobs/, async (msg) => {
        await botController.jobs(msg)
    });

    /* Users */
    bot.onText(/\/reg/, async (msg) => {
        await botController.regUser(msg);
    });

    /* Polls */
    bot.on("poll_answer", async (answer) => {
        await botController.managePollAnswer(answer);
    });

    bot.on("callback_query", async (query) => {
        console.log('query', query)
        try {
            // all callback now need a chat and message id so it general check for all cb
            const chatId = query.message?.chat.id;
            const msgId = query.message?.message_id;
            const name = query.from.first_name;
            if (!chatId || !msgId) {
                return;
            }
            if (query.data === 'statusOk') {
                await bot.sendMessage(chatId, `${name} говорит что статус будет`)
                await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id: chatId, message_id: msgId})
                return;
            }
            if (query.data === 'statusNotOk') {
                await bot.sendMessage(chatId, `${name} говорит что статуса не будет`)
                await bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id: chatId, message_id: msgId})
                return;
            }

        } catch (e) {
            console.error('callback_query', e)
        }
    });

    bot.onText(/\/call/, async (msg) => {
        await botController.callAllLastPollUsers(msg);
    });

    /* Dev */
    bot.onText(/\/dev/, async (msg) => {
        await botController.dev(msg);
    });

    /* short Answers */
    bot.on('message', async (msg) => {
        await botController.shortAnswers(msg)
    });
}

main();
