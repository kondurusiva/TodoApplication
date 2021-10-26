const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const dbPath = path.join(__dirname, "todoApplication.db");
initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasStatusAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let getsQuery = "";
  let data = null;
  switch (true) {
    case hasStatusAndPriorityProperties(request.query):
      getsQuery = `
        SELECT 
            * 
        FROM 
            todo 
        WHERE 
            status='${status}' AND priority='${priority}' AND todo LIKE '%${search_q}%';`;
      break;
    case hasPriorityProperty(request.query):
      getsQuery = `
        SELECT 
            *
        FROM 
            todo
        WHERE
            priority='${priority} AND todo LIKE '%${search_q}%';`;
      break;
    case hasStatusProperty(request.query):
      getsQuery = `
        SELECT 
            *
        FROM 
            todo
        WHERE
            todo LIKE '%${search_q}%' AND status='${status}';`;
      break;
    default:
      getsQuery = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getsQuery);
  response.send(data);
});

// API 2
app.get(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const idQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    id=${todoId};`;
  const idBased = await db.get(idQuery);
  response.send(idBased);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", (request, response) => {
  const { status, priority, todo } = request.query;
});
