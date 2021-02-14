import mongoose from 'mongoose';

const NAME = process.env.DB_USER_NAME;
const PASSWORD = process.env.DB_USER_PASSWORD;
const DBNAME = process.env.DB_COLLECTION_NAME;

const uri = `mongodb+srv://${NAME}:${PASSWORD}@cluster0.lcqjy.mongodb.net/${DBNAME}?retryWrites=true&w=majority`;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (e) {
        console.error(`MongoDB connection failed`);
        console.error(e);
        process.exit(1);
    }
}

export default connectDB