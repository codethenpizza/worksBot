import JobController from "./modules/jobs/JobController";

process.env.NTBA_FIX_319 = String(1); // fix err
import dotenv from 'dotenv'
dotenv.config({path: './.env'});

import TelegramBot from "node-telegram-bot-api";
import getBot from './modules/bot/index';
import connectDB from "./config/database";
import UserController from "./modules/user/UserController";
import {IUser} from "./models/User";
import {createPoll} from "./modules/jobs/JobEvents";


const main = async () => {
    const bot: TelegramBot = await getBot;
    await connectDB();

    // general commands
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            await bot.sendMessage(chatId, `Все ок`)
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Чет не ок`)
        }
    });

    // jobs
    bot.onText(/\/jobs/, async (msg) => {
        const chatId = msg.chat.id;
        const jobController = new JobController(chatId);
        try {
            const jobs = await jobController.findJobsByChatId();
            await bot.sendMessage(chatId, `Для этого чата зарегано ${jobs.length} работ`);
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Чет не ок`)
        }
    })

    bot.onText(/\/addjobs/, async (msg) => {
        const chatId = msg.chat.id;
        const jobController = new JobController(chatId);
        try {
            await jobController.createDefaultJobs()
            const jobs = await jobController.findJobsByChatId();
            await bot.sendMessage(chatId, `Для этого чата зарегано ${jobs.length} работ`);
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Чет не ок`)
        }
    })

    //users
    bot.onText(/\/reg/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            if (!msg.from) {
                return;
            }
            const {id, first_name, last_name} = msg.from;
            const dbUser: IUser = {
                telegramId: id,
                firstName: first_name,
                lastName: last_name,
                chatId
            }
            await UserController.createUser(dbUser)
            await bot.sendMessage(chatId, `Все ок, сохранил`);
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Все не ок, не сохранил`);
        }
    })


    // short answers
    bot.onText(/лол/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, `кек`)
    })
    bot.onText(/\)\)\)\)/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, `)))0)00`)
    })

    bot.onText(/(созво)|(Андр)/gi, async (msg) => {
        const chatId = msg.chat.id;
        await createPoll({bot, chatId})
    })

}

main();
