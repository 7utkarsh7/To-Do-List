//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-utkarsh:Test123@cluster0.r5ked.mongodb.net/todolistDB", {
  useUnifiedTopology: 1,
  useNewUrlParser: 1
});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welocome!"
});
const item2 = new Item({
  name: "Press+ to add new item"
});
const item3 = new Item({
  name: "<-- Click this to remove an item"
});

const defaultArray = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });



});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    });
  }


});
app.post("/delete", function(req, res) {
  const checkedItemid = req.body.checkbox;
  const newlistName = req.body.newlistName;
  if (newlistName === "Today") {
    Item.findByIdAndRemove(checkedItemid, function(err) {
      if (!err) {
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({
      name: newlistName
    }, {
      $pull: {
        items: {
          _id: checkedItemid
        }
      }
    }, function(err, foundList) {
      if (!err) {
      res.redirect("/"+newlistName);
      } else {
        console.log(err);
      }
    });
  }
});

app.get("/:paramName", function(req, res) {
  const pageName =_.capitalize (req.params.paramName);
  List.findOne({
    name: pageName
  }, function(err, pagePresent) {
    if (!err) {
      if (!pagePresent) {
        // create new list
        var list = new List({
          name: pageName,
          items: defaultArray
        });
        list.save();
        res.redirect("/" + pageName)
      } else {
        // show existing list
        res.render("list", {
          listTitle: pagePresent.name,
          newListItems: pagePresent.items
        })
      }

    } else {
      console.log(err);
    }
  });



});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
