import JobController from "./modules/jobs/JobController";

process.env.NTBA_FIX_319 = String(1); // fix err
import dotenv from 'dotenv'
dotenv.config({path: './.env'});

import TelegramBot from "node-telegram-bot-api";
import getBot from './modules/bot/BotInit';
import UserController from "./modules/user/UserController";
import {IUser} from "./modules/user/types";
import {IPollVotesUpdateOptions} from "./modules/polls/types";
import PollController from "./modules/polls/PollController";

const main = async () => {
    const bot: TelegramBot = await getBot();

    // general commands
    bot.onText(/\/marco/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            await bot.sendMessage(chatId, `Polo`)
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Чет не ок`)
        }
    });

    // jobs
    bot.onText(/\/jobs/, async (msg) => {
        const chatId = msg.chat.id;
        const jobController = new JobController(bot, chatId);
        try {
            const jobs = await jobController.findJobsByChatId();
            await bot.sendMessage(chatId, `Зарегано работ для этого чата: ${jobs.length}`);
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Чет не ок`)
        }
    })

    bot.onText(/\/addjobs/, async (msg) => {
        const chatId = msg.chat.id;
        const jobController = new JobController(bot, chatId);
        try {
            await jobController.createDefaultJobs();
            const jobs = await jobController.findJobsByChatId();
            await bot.sendMessage(chatId, `Зарегано работ для этого чата: ${jobs.length}`);
        } catch (e) {
            console.error(e)
            await bot.sendMessage(chatId, `Чет не ок`)
        }
    })

    bot.onText(/\/delAlljobs/, async (msg) => {
        const chatId = msg.chat.id;
        const jobController = new JobController(bot, chatId);
        try {
            await jobController.deleteAllJobs();
            await bot.sendMessage(chatId, `Работы удалены`);
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
            const {id, first_name, last_name, username} = msg.from;
            const dbUser: IUser = {
                telegramId: id,
                userName: username,
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

    //polls
    bot.on("poll_answer", async answer => {
        try {
            const options: IPollVotesUpdateOptions = {
                pollId: answer.poll_id,
                user: {
                    telegramId: answer.user.id,
                    firstName: answer.user.first_name,
                    lastName: answer.user.last_name,
                    userName: answer.user.username,
                },
                answerOptionsIndexes: answer.option_ids
            }
            await PollController.updateVotes(options);
        } catch (e) {
            console.error(e);
            await bot.sendMessage(answer.poll_id, 'оуч');
        }
    })

    // short answers
    bot.onText(/лол|кек/, async (msg) => {
        const chatId = msg.chat.id;
        const isLol = msg.text && msg.text.match(/лол/);
        const answer = isLol ? 'кек' : 'лол';
        await bot.sendMessage(chatId, answer)
    })

    bot.onText(/\)\)\)\)/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, `)))0)00`)
    })

    bot.onText(/\/call/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            const mentions = await PollController.getLastPollUserMentions();
            if (!mentions.length) {
                await bot.sendMessage(chatId, 'Некого звать');
                return;
            }
            const message = 'Го на созвон \n' + mentions.join(' ');
            await bot.sendMessage(chatId, message);
        } catch (e) {
            console.error(e);
            await bot.sendMessage(chatId, `опс`);
        }
    })
}

main();
