import PollSchema from "../../models/Polls";
import {IPollSchema, IPoll, IPollVotesMap, IPollVote, IPollVotesUpdateOptions} from "./types";
import UserController from "../user/UserController";
import UserSchema from "../../models/User";

class PollController {
    // create poll
    public static async createPoll(poll: IPoll): Promise<IPollSchema> {
        return await PollSchema.create(poll);
    }

    // update poll votes
    public static async updateVotes(options: IPollVotesUpdateOptions) {
        const {pollId, user, answerOptionsIndexes} = options
        const poll: IPollSchema | null = await PollSchema.findOne({pollId}).exec();
        if (!poll) {
            throw new Error(`poll with id ${pollId} doesn't exist`);
        }

        const dbUser = await UserController.findOrCreateUser({
            chatId: poll.chatId,
            ...user,
        })

        const newVote: IPollVotesMap = PollController.getVotesMap(dbUser.telegramId, answerOptionsIndexes);
        const mergedVotes = PollController.mergeVotes(poll.votes, newVote);
        await PollSchema.updateOne({pollId: poll.pollId}, {votes: mergedVotes});
    }

    private static getVotesMap(userTelegramId: number, answerOptionsIndexes: number[]) {
        const newVote: IPollVotesMap = {};
        newVote[userTelegramId] = {
            userTelegramId,
            option: answerOptionsIndexes
        };
        return newVote
    }

    private static mergeVotes(oldVotes = {}, newVotes: IPollVotesMap): IPollVotesMap {
        return Object.assign({}, oldVotes, newVotes)
    }

    // if empty return empty arr of mentions
    public static async getLastPollUserMentions(chatId: number): Promise<string[]> {
        const poll = await PollController.getLastPoll(chatId);
        if (!poll || !poll.votes || !Object.keys(poll.votes).length) {
            return []
        }
        const answers = Object.values(poll.votes);
        // temporary check answers by index bc haven't multiply answers polls
        const filteredAnswers = answers.filter(answer => answer.option[0] === 0)
        const usersTelegramIds = filteredAnswers.map(answer => Number(answer.userTelegramId));
        const users = await UserSchema.find({
            telegramId: {
                $in: usersTelegramIds
            },
            chatId: poll.chatId
        })

        if (!users) {
            return []
        }

        return users.map(user => {
            return `@${user.userName}`
        })
    }

    public static async getLastPoll(chatId: number) {
        return PollSchema.findOne({chatId}).sort({createdAt: -1}).exec();
    }
}

export default PollController