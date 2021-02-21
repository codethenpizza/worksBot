import mongoose, {Schema} from "mongoose";
import {IPollSchema} from "../modules/polls/types";


const PollSchema: Schema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
    },
    pollMessageId: {
        type: Number,
        required: true,
    },
    pollId: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    answers: {
        type: Array,
        required: true,
    },
    votes: {
        type: Object,
        default: {},
    },
    createdAt: {
        type: Date,
        required: false,
    },
}, {timestamps: true})

export default mongoose.model<IPollSchema>('Poll', PollSchema)