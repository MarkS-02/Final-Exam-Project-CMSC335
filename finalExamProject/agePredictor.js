process.stdin.setEncoding("utf8");

const path = require("path");
const express = require("express");
const http = require("http");
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const uri= `mongodb+srv://mark55:${process.env.MONGO_DB_PASSWORD}@cluster0.vwotp0z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)


if(process.argv.length != 3) {
    process.stdout.write(`Usage agePredictor.js INVALID ARGUMENTS`);
    process.exit(1);
}

let port = process.argv[2];
let homeLink = `<a href="http://localhost:${port}">HOME</a>`;
let app = express();

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

const webserver = http.createServer(app);
webserver.listen(port);
console.log(`Web server is running at http://localhost:${port}`);
process.stdout.write("Type s to quit: ");
let prompt = "Type s to quit: ";
let allAges = []

/* Getting age ane name from individual*/
async function insertName(name_to_insert, age) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();

        let application = 
        {
            pname: name_to_insert, 
            age: age,
        };

        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(application);
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function getAge(name){

    const agifyResponse = await fetch(`https://api.agify.io?name=${name}`);
    const agifyData = await agifyResponse.json();
    console.log(agifyData)
    expectedAge = await agifyData.age;

    return await expectedAge;
}


app.get("/", (request, response) => {
    response.render("index");
});

app.get("/tryPredict", (request, response) => {
    let application =
    {
        home: homeLink
    };

    response.render("tryPredict", application);
});

app.post("/tryPredict", async (request, response) => {
    home= homeLink
    let {name_to_insert,age} = request.body
    await insertName(name_to_insert, age);
    expectedAge = await getAge(name_to_insert)
    ageDifference = Math.abs(expectedAge - age);
    allAges = allAges.concat(age)

    try {
    } catch(e) {
        console.log("ERROR: " + e);
    }
    response.render("processPredict", {name_to_insert,age:age, home});
});

app.get("/ageDisplay", (request,response)=>{
    let application =
    {
        home: homeLink,
        allAges: allAges
    };
    response.render("ageDisplay", application);
});
app.post("ageDisplay", async (request,response)=>{
    home= homeLink
    let allAges = request.body
    console.log(allAges)
    try {
    } catch(e) {
        console.log("ERROR: " + e);
    }
    response.render("ageDisplay", {allAges, home});
});

process.stdin.on("readable", () => 
{
  let dataInput = process.stdin.read();

  if (dataInput !== null) {
    let command = dataInput.trim();
    if (command === "s") {
      process.stdout.write("Shutting down the server\n");
      process.exit(0);
    }
    else {
        process.stdout.write(`Invalid command: ${command}\n`);
    }
    process.stdout.write(prompt);
    process.stdin.resume();
  }
});