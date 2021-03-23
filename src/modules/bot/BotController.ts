import TelegramBot, {Message, PollAnswer} from "node-telegram-bot-api";
import JobController from "../jobs/JobController";
import {IUser} from "../user/types";
import UserController from "../user/UserController";
import {IPollVotesUpdateOptions} from "../polls/types";
import PollController from "../polls/PollController";
import {allMethods} from "../jobs/data/JobMethods";


class BotController {
    bot: TelegramBot

    constructor(bot: TelegramBot) {
        this.bot = bot
    }

    /* General commands */
    public async ping(msg: Message) {
        const chatId = msg.chat.id;
        try {
            await this.bot.sendMessage(chatId, `Polo \n (chat: ${chatId}, user: ${msg.from?.id})`)
        } catch (e) {
            console.error(e)
            await this.bot.sendMessage(chatId, `Чет не ок`)
        }
    }

    /* Jobs */
    public async jobs(msg: Message) {
        const adminId = Number(process.env.ADMIN_TELEGRAM_ID);
        const chatId = msg.chat.id;
        if (msg.from?.id !== adminId || !msg.text) {
            await this.bot.sendMessage(chatId, 'Я же знаю что ты не админ');
            return
        }

        if (!msg.text) {
            return
        }
        const isAddJobs = msg.text.match(/add/)
        const isDelJobs = msg.text.match(/del/)

        if (isAddJobs && isDelJobs) {
            await this.bot.sendMessage(chatId, 'add or dell?');
            return;
        }

        if (isAddJobs) {
            const action = msg.text.match(/(?<=—).*$/gi);

            if (!action || !action.length) {
                // TODO get list of jobs
                await this.bot.sendMessage(chatId, 'please type add --all or add (one or all of jobs) --A,B,C');
                return;
            }
            if (action.length > 1) {
                console.warn('jobs: action list match longer than 1');
            }

            const text = action[0];

            if (text === 'all') {
                await this.addDefaultJobs(chatId);
                return;
            }

            const list = text.split(',').map(n => n.trim())
            await JobController.createJobsForChatByName(list, chatId)
            await this.getJobsInfo(chatId);
            return;
        }
        if (isDelJobs) {
            await this.delJobs(chatId);
            return;
        }

        await this.getJobsInfo(chatId);
    }

    private async getJobsInfo(chatId: number) {
        const jobs = await JobController.findJobsByChatId(chatId);
        await this.bot.sendMessage(chatId, `Зарегано работ для этого чата: ${jobs.length}`);
    }

    private async addDefaultJobs(chatId: number) {
        try {
            await JobController.createDefaultJobs(chatId);
            const jobs = await JobController.findJobsByChatId(chatId);
            await this.bot.sendMessage(chatId, `Зарегано работ для этого чата: ${jobs.length}`);
        } catch (e) {
            console.error(e)
            await this.bot.sendMessage(chatId, `Чет не ок`)
        }
    }

    private async delJobs(chatId: number) {
        try {
            await JobController.deleteAllJobs(chatId);
            await this.bot.sendMessage(chatId, `Работы удалены`);
        } catch (e) {
            console.error(e)
            await this.bot.sendMessage(chatId, `Чет не ок`)
        }
    }

    /* Users */
    public async regUser(msg: Message) {
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
            await this.bot.sendMessage(chatId, `Все ок, сохранил`);
        } catch (e) {
            console.error(e)
            await this.bot.sendMessage(chatId, `Все не ок, не сохранил`);
        }
    }

    /* Polls */
    public async managePollAnswer(answer: PollAnswer) {
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
        }
    }

    // Call users which needed eve call
    public async callAllLastPollUsers(msg: Message) {
        const chatId = msg.chat.id;
        try {
            const mentions = await PollController.getLastPollUserMentions(chatId);
            if (!mentions.length) {
                await this.bot.sendMessage(chatId, 'Некого звать');
                return;
            }
            const message = 'Го на созвон \n' + mentions.join(' ');
            await this.bot.sendMessage(chatId, message);
        } catch (e) {
            console.error(e);
            await this.bot.sendMessage(chatId, `опс`);
        }
    }


    /* Dev */
    public async dev(msg: Message) {
        const adminId = Number(process.env.ADMIN_TELEGRAM_ID);
        const chatId = msg.chat.id;
        if (msg.from?.id !== adminId || !msg.text) {
            await this.bot.sendMessage(chatId, 'Я же знаю что ты не админ');
            return
        }

        const isPoll = msg.text.match(/poll/)
        const isAsk = msg.text.match(/ask/)
        const isUnpin = msg.text.match(/unpin/)

        if (isPoll) {
            await this.pollDev(chatId);
            return;
        }

        if (isAsk) {
            await this.askDev(chatId);
            return;
        }

        if (isUnpin) {
            await this.unpinPoll(chatId);
            return;
        }

        await this.bot.sendMessage(chatId, 'dev what?')
    }

    private async pollDev(chatId: number) {
        await allMethods.createStatusPoll({bot: this.bot, chatId})
    }

    private async askDev(chatId: number) {
        await allMethods.getStatusInfo({bot: this.bot, chatId})
    }

    private async unpinPoll(chatId: number) {
        await allMethods.unpinPoll({bot: this.bot, chatId});
    }

    /* short Answers */
    public async shortAnswers(msg: Message) {
        if (!msg.text) {
            return
        }
        const chatId = msg.chat.id;

        const isSmiles = msg.text.match(/\)\)\)\)/);
        const isLol = msg.text.match(/лол/i);
        const isKek = msg.text.match(/кек/i);

        if (isSmiles) {
            await this.bot.sendMessage(chatId, `)))0)00`)
        }
        if (isLol) {
            await this.bot.sendMessage(chatId, `лол`)
        }
        if (isKek) {
            await this.bot.sendMessage(chatId, `кек`)
        }
    }
}

export default BotController;
