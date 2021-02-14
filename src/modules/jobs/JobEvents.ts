import {IJobEventsSet, IJobMethod, IJobMethodOptions} from "../../models/Jobs";

export const getStatusInfo = async (opt: IJobMethodOptions) => {
    const {bot, chatId} = opt;
    const status_time = '15:00'
    await bot.sendMessage(chatId, `Кирилл, будет статус в ${status_time}?`);
};

export const createPoll = async (opt: IJobMethodOptions) => {
    const {bot, chatId} = opt;
    const question = 'Ребзя, нужен созвон с Андреем?';
    const answers = ['Да', 'Нет'];
    const options = {
        is_anonymous: false,
        open_period: 30000,
    }

    await bot.sendPoll(chatId, question, answers, options);
};

// export only for seeders
export const allEvents: IJobEventsSet = {
    getStatusInfo,
    createPoll
}

const getJobEvent = (methodName: string): IJobMethod | null => {
    const method: IJobMethod | undefined = allEvents[methodName];
    if (method === undefined) {
        return null
    }
    return method
}


export default getJobEvent;