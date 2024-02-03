import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
// import ENV from '../config.js'
import dotenv from 'dotenv';
dotenv.config()

async function connect(){

    const mongod = await MongoMemoryServer.create();
    const getUri = mongod.getUri();

    // const db = await mongoose.connect(getUri);
    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(process.env.ATLAS_URI);
    console.log("Database Connected")
    return db;
}

export default connect;