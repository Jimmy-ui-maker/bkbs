import mongoose from "mongoose";

export default async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("db connected successfully");
  } catch (error) {
    console.log("error ", error);
  }
}
