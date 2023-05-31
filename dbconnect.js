const mongoose = require("mongoose");

module.exports = async () => {
  const mongoUrl =
    "mongodb+srv://root:root@cluster0.dr3cy41.mongodb.net/?retryWrites=true&w=majority";

  try {
    mongoose.connect(
      mongoUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => {
        console.log("MOngoDb connected");
      }
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
