//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false
// });

mongoose.connect("mongodb+srv://admin_jan:gHYXmoHz)9tHz9ZFB2W9+*^t@cluster0.uo4op.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = {
  name: {
    type: String,
    required: [true, "No item added."]
  }
};

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist App."
});

const item2 = new Item({
  name: "You can add items by clicking the '+' sign."
});

const item3 = new Item({
  name: "You can add custom todolists by adding the name of your list after the '/' in the url."
});

const item4 = new Item({
  name: "Check the items your finished with."
})

const defaultItems = [item1, item2, item3, item4];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find(function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully added the default items to Items collection.");
          }
        });
        res.redirect("/");

      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    }
  });

});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {

    if (!err) {

      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();

        res.redirect("/" + customListName);

      } else {
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items
        });
      }
    }
  });

});

app.post("/", function(req, res) {

  const listName = req.body.list;

  const newItem = new Item({
    name: req.body.newItem
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();

      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {

  const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;

  // Item.deleteOne({_id: checkedItemId}, function(err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("Successfully deleted the item with the _id: " + checkedItemId + ".");
  //   }
  // });
  //
  // res.redirect("/");

  if (listName === "Today") {
    // Post request from efault List:
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted the item with the _id: " + checkedItemId + ".");
        res.redirect("/");
      }
    });
  } else {
    // Post from custom list:

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, result) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

    }
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
