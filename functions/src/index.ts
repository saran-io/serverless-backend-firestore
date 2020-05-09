/**
 * * This is the REST API backend setup for firestore project demo
 * * The project details are provided below
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";

//firebase db initializaton
admin.initializeApp(functions.config().firebase);

//add the database for firestore
const db = admin.firestore();

//express app  setup
const app = express();
const main = express();

/**
 * * API V1 is the end point declaration
 */

main.use("/api/v1", app);
// tslint:disable-next-line: deprecation
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.get("/warmup", (request, response) => {
  response.send("Warming up the REST API");
});

//this is the rest end point for posting.creating the fight

app.post("/fights", async (request, response) => {
  try {
    const { winner, losser, title } = request.body;
    const data = {
      winner,
      losser,
      title,
    };

    const fightRef = await db.collection("fights").add(data);
    const fight = await fightRef.get();

    response.json({
      id: fightRef.id,
      data: fight.data(),
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

/**
 * * App get method to get the ID
 */

app.get("/fights/:id", async (request, response) => {
  try {
    const fightId = request.params.id;
    if (!fightId) throw new Error("Fight ID is required");

    const fight = await db.collection("fights").doc(fightId).get();
    if (!fight.exists) {
      throw new Error("Fight does not exist");
    }

    response.json({
      id: fight.id,
      data: fight.data(),
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

/**
 * * Get records list
 */

app.get("/fights", async (request, response) => {
  try {
    const fightQuerySnapshot = await db.collection("fights").get();
    const fights = [];
    fightQuerySnapshot.forEach((doc) => {
      fights.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    response.json(fights);
  } catch (error) {
    response.status(500).send(error);
  }
});

/**
 * * to update the record use this option
 */

app.put("/fights/:id", async (request, response) => {
  try {
    const fightId = request.params.id;
    const title = request.body.title;

    if (!fightId) throw new Error("Fight ID is not available. Please check");
    if (!title) throw new Error("Title is not available ");

    const data = {
      title,
    };

    const fightRef = await db
      .collection("fights")
      .doc(fightId)
      .set(data, { merge: true });

    response.json({
      id: fightId,
      data,
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

/**
 * ! To Delete the data in the market
 */

app.delete("/fights/:id", async (request, response) => {
  try {
    const fightId = request.params.id;
    if (!fightId) throw new Error("Fight ID is not available. Please check");
    await db.collection("fights").doc(fightId).delete();
    response.json({
      id: fightId,
    });
  } catch (error) {
    response.status(500).send(error);
  }
});
