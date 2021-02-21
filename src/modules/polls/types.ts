import {Document} from "mongoose";
import {IUserInfo} from "../user/types";

export interface IPollVote {
    userTelegramId: number,
    option: number | number[]
}

export interface IPollVotesMap {
    [key: number]: IPollVote
}

export interface IPoll {
    chatId: number
    pollMessageId: number
    pollId: string
    question: string
    answers: string[]
    createdAt?: Date
    votes?: IPollVotesMap
}

export interface IPollSchema extends IPoll, Document {}

export interface IPollVotesUpdateOptions {
    pollId: string
    user: IUserInfo
    answerOptionsIndexes: number[]
}