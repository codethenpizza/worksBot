import mongoose, {Schema} from "mongoose";
import IJob from "../modules/jobs/types";


const JobSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    schedule: {
        type: String,
        required: true,
    },
    methodName: {
        type: String,
        required: false,
    },
    chatId: {
        type: Number,
        required: false,
    },
})

export default mongoose.model<IJob.JobSchema>('Job', JobSchema)