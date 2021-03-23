import {IPoll} from "../../polls/types";
import PollController from "../../polls/PollController";
import IJob from "../types";


export const getStatusInfo = async (opt: IJob.JobMethodOptions) => {
    const {bot, chatId} = opt;
    const status_time = '15:00'
    const mention = '@kmsid'
    try {
        await bot.sendMessage(chatId, `${mention} \nКирилл, будет статус в ${status_time}?`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Будет',
                            callback_data: 'statusOk'
                        }
                    ], [
                        {
                            text: 'Не-а',
                            callback_data: 'statusNotOk'
                        }
                    ]

                ]
            }
        });
    } catch (e) {
        console.error('getStatusInfo', e)
    }
};

export const createStatusPoll = async (opt: IJob.JobMethodOptions) => {
    try {
        const {bot, chatId} = opt;
        const question = `Ребзя, нужен созвон с Андреем?`;
        const answers = ['Да', 'Нет'];
        const options = {
            is_anonymous: false,
        }
        const msg = await bot.sendPoll(chatId, question, answers, options);
        const poll: IPoll = {
            chatId,
            pollMessageId: msg.message_id,
            question,
            answers,
            pollId: msg.poll!.id,
        }
        await PollController.createPoll(poll);
        await bot.pinChatMessage(chatId, String(msg.message_id));

    } catch (e) {
        console.error('createStatusPoll', e)
    }
};

// TODO unpin poll not by cron job, but after N hour after createStatusPoll method calls
export const unpinPoll = async (opt: IJob.JobMethodOptions) => {
    try {
        const {bot, chatId} = opt;
        const poll = await PollController.getLastPoll(chatId);
        if (!poll) {
            return;
        }
        await bot.unpinChatMessage(chatId);
    } catch (e) {
        console.error('unpinPoll', e)
    }
}

// export only for seeders
export const allMethods: IJob.JobEventsSet = {
    getStatusInfo,
    createStatusPoll,
    unpinPoll
}

const getJobMethod = (methodName: string): IJob.JobMethod | null => {
    const method: IJob.JobMethod | undefined = allMethods[methodName];
    if (method === undefined) {
        return null
    }
    return method
}


export default getJobMethod;