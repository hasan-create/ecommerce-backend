const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const args = process.argv.slice(2);
const localArg = args.find((arg) => arg.startsWith("--local="));
const atlasArg = args.find((arg) => arg.startsWith("--atlas="));

const localUri = localArg
  ? localArg.split("=")[1]
  : process.env.LOCAL_MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerse";

const atlasUri = atlasArg ? atlasArg.split("=")[1] : process.env.MONGODB_URL;

if (!atlasUri) {
  console.error("Missing Atlas URI. Set MONGODB_URL or pass --atlas=");
  process.exit(1);
}

async function getCounts(db) {
  const collections = ["users", "products", "carts", "feedbacks", "orders"];
  const result = {};
  for (const name of collections) {
    result[name] = await db.collection(name).countDocuments({});
  }
  return result;
}

async function migrateCollection(localDb, atlasDb, collectionName) {
  const localDocs = await localDb.collection(collectionName).find({}).toArray();

  if (localDocs.length === 0) {
    return { collectionName, localCount: 0, upserted: 0, modified: 0, errors: 0 };
  }

  let upserted = 0;
  let modified = 0;
  let errors = 0;

  const operations = localDocs.map((doc) => {
    if (collectionName === "users") {
      const { _id, ...rest } = doc;
      return {
        updateOne: {
          filter: { email: doc.email },
          update: {
            $set: rest,
            $setOnInsert: { _id },
          },
          upsert: true,
        },
      };
    }

    return {
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    };
  });

  const chunkSize = 200;
  for (let i = 0; i < operations.length; i += chunkSize) {
    const chunk = operations.slice(i, i + chunkSize);

    try {
      const res = await atlasDb.collection(collectionName).bulkWrite(chunk, {
        ordered: false,
      });
      upserted += res.upsertedCount || 0;
      modified += res.modifiedCount || 0;
    } catch (error) {
      errors += 1;
      console.log(`[WARN] ${collectionName} chunk failed: ${error.message}`);
    }
  }

  return {
    collectionName,
    localCount: localDocs.length,
    upserted,
    modified,
    errors,
  };
}

async function run() {
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();

  try {
    const localDb = localConn.db;
    const atlasDb = atlasConn.db;

    console.log("Local counts before migration:");
    const localBefore = await getCounts(localDb);
    console.log(localBefore);

    console.log("Atlas counts before migration:");
    const atlasBefore = await getCounts(atlasDb);
    console.log(atlasBefore);

    const collections = ["users", "products", "carts", "feedbacks", "orders"];
    const reports = [];

    for (const name of collections) {
      const report = await migrateCollection(localDb, atlasDb, name);
      reports.push(report);
    }

    console.log("Migration reports:");
    for (const report of reports) {
      console.log(report);
    }

    console.log("Atlas counts after migration:");
    const atlasAfter = await getCounts(atlasDb);
    console.log(atlasAfter);
  } finally {
    await localConn.close();
    await atlasConn.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("DB migration failed:", error.message);
    process.exit(1);
  });
