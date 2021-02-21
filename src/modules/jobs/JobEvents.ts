
import {IJobMethodOptions, IJobEventsSet, IJobMethod} from "./types";
import {IPoll} from "../polls/types";
import PollController from "../polls/PollController";

export const getStatusInfo = async (opt: IJobMethodOptions) => {
    const {bot, chatId} = opt;
    const status_time = '15:00'
    const mention = '@kmsid'
    await bot.sendMessage(chatId, `${mention} \nКирилл, будет статус в ${status_time}?`);
};

export const createStatusPoll = async (opt: IJobMethodOptions) => {
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
};

// export only for seeders
export const allEvents: IJobEventsSet = {
    getStatusInfo,
    createStatusPoll
}

const getJobEvent = (methodName: string): IJobMethod | null => {
    const method: IJobMethod | undefined = allEvents[methodName];
    if (method === undefined) {
        return null
    }
    return method
}


export default getJobEvent;