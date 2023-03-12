//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({name: 'Orange'});
const item2 = new Item({name: 'Banana'});
const item3 = new Item({name: 'Grapes'});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res) {

  Item.find({})
  .then(function(foundItems){
    if(foundItems.length === 0 ){
      Item.insertMany(defaultItems)
      .then(function(result){
        console.log('Successfully saved defult items to DB!');
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect('/');
    } else {
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }    
  })
  .catch(function(error){
    console.log(error);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({name: itemName});
  item.save().then(function(savedItem){
    res.redirect('/');
  });
});

app.post('/delete', function(req, res){
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId).then(function(result){
    console.log('Deleted Successfully');
    res.redirect('/');
  });
});

app.get('/:customListName', function(req, res){
  const customListName = req.params.customListName;
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
