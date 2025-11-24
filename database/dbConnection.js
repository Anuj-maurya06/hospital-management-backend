import mongoose from "mongoose";

let cached = global.mongoose; // global cache

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnection() {
  if (cached.conn) {
    return cached.conn; // connection already exists
  }

  if (!cached.promise) {
    const opts = {
      dbName: "anuj",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  console.log("connected to database");
  return cached.conn;
}



// import mongoose from "mongoose";
 
// export const dbConnection = ()=>{
//   mongoose.connect(process.env.MONGO_URL,{
//     dbName:"anuj"
//   }).then(()=>{
//     console.log("connected to database")
//   }).catch(err=>{
//     console.log(`some error occured while connect to database: ${err}`)
//   });
// }



 