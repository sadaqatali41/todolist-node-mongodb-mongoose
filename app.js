//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

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

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

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
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if(listName === 'Today') {
    item.save().then(function(savedItem){
      res.redirect('/');
    });
  } else {
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save().then(function(){
        res.redirect('/' + listName);
      });
    });
  }
});

app.post('/delete', function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId).then(function(result){
      console.log('Deleted Successfully');
      res.redirect('/');
    });
  } else {
    List.findOneAndUpdate(
      {
        name: listName
      }, 
      {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      }
      ).then(function(foundList){
      res.redirect('/' + listName);
    }).catch(function(e){
      console.log(e);
    });
  }
});

app.get('/:customListName', function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList) {
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save().then(function(){
        res.redirect('/' + customListName);
      });
    } else {
      // show an existing list
      res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(error){
    console.log(error);
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
  // db.collection.drop()
});
