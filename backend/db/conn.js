const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB)
// , {
//     useNewUrlParser : true,
//     useUnifiedTopology : true,
//     useCreateIndex : true
// })
.then(() => {
    console.log(`DataBase Connection Successfully Buddy`);
}).catch((e) => {
    console.log(`DataBase Not Connected`);
});