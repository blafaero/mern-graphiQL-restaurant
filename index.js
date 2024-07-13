var express = require("express")
var { createHandler } = require("graphql-http/lib/use/express")
var { buildSchema } = require("graphql")
var { ruruHTML } = require("ruru/server")

let id = 4;

var restaurants = [
  {
    id: 1,
    name: "WoodsHill ",
    description:
      "American cuisine, farm to table, with fresh produce every day",
    dishes: [
      {
        name: "Swordfish grill",
        price: 27,
      },
      {
        name: "Roasted Broccily ",
        price: 11,
      },
    ],
  },
  {
    id: 2,
    name: "Fiorellas",
    description:
      "Italian-American home cooked food with fresh pasta and sauces",
    dishes: [
      {
        name: "Flatbread",
        price: 14,
      },
      {
        name: "Carbonara",
        price: 18,
      },
      {
        name: "Spaghetti",
        price: 19,
      },
    ],
  },
  {
    id: 3,
    name: "Karma",
    description:
      "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    dishes: [
      {
        name: "Dragon Roll",
        price: 12,
      },
      {
        name: "Pancake roll ",
        price: 11,
      },
      {
        name: "Cod cakes",
        price: 13,
      },
    ],
  },
];

var schema = buildSchema(`
type Query {
  restaurant(id: Int): [restaurant]
  restaurants: [restaurant]
}
type Mutation {
  setrestaurant(input: restaurantInput): [restaurant]
  deleterestaurant(id: Int!): DeleteResponse
  editrestaurant(id: Int!, name: String!, description: String!): [restaurant]
}
type restaurant {
  id: Int
  name: String
  description: String
  dishes: [Dish]
}
type Dish {
  name: String
  price: Int
}
input restaurantInput {
  name: String
  description: String
}
type DeleteResponse {
  ok: Boolean!
}
`);
 
// The root provides a resolver function for each API endpoint
var root = {
  restaurant : (arg) => restaurants.filter(item => item.id == arg.id),
  restaurants : () => restaurants,
  setrestaurant: ({input}) => {
    restaurants.push({"name" : input.name, "description": input.description, "id": id});
    id ++;
    return(restaurants);
  },
  deleterestaurant : (arg) => {
    let ok = Boolean(restaurants.filter(item => item.id == arg.id).length);
    restaurants = restaurants.filter(item => item.id != arg.id);
    return {ok}
  },
  editrestaurant: ({ id, ...restaurant }) => {
    let original = restaurants.filter( item => item.id != id);
    let updated = restaurants.filter( item => item.id == id);
    updated[0].name = restaurant.name;
    updated[0].description = restaurant.description;
    restaurants = [...original, ...updated];
    return(updated);
  },
}
 
var app = express()
 
// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
)

// Serve the GraphiQL IDE.
app.get("/", (_req, res) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/graphql" }))
})
 
// Start the server at port
var port = 5500;
app.listen(port, () => console.log(`Running a GraphQL API server at http://localhost:${port}/graphql`));


