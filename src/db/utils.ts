import { connect } from "mongoose";
import { config } from "dotenv";
import { getToken } from "./index";

config()

export const connectDB = async () => {
    try {
        connect(`${process.env.MONGO_URI}`)
        console.log("Connection to the Database was successful.")
    } catch (error) {
        console.log(error)
    }
}

export const tokenExists = async (mint: string) => {
    const token = await getToken(mint)
    
    return token ? true : false
}