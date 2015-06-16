gameSettings = new Meteor.Collection('settings');
Surveys = new Meteor.Collection('surveys');
Scores = new Meteor.Collection('scores');

if (Meteor.isClient) {
  // counter starts at 0
  
    
  Session.setDefault('isAdmin',true);
    
  Template.admin.events({
     
    'change .houseSelect':function(e){
    var house = $(e.target).prop("id");
    
    var currSide = gameSettings.findOne({name:house});
    console.log(currSide);
    gameSettings.update({_id:currSide._id},{$set:{value:$(e.target).val()}});   
        
    },
    'change .strikes': function(e){
        
    var team = $(e.target).prop("id").split('?')[0];
    var currSide = gameSettings.findOne({name:team});
    var currTeam = gameSettings.findOne({name:currSide.value});
    var array = [];
    for(var i = 0;i<$(e.target).val();i++){
    array.push('');    
        
    }
    
    gameSettings.update({_id:currTeam._id},{$set:{strikes:array}});  
    console.log(gameSettings.findOne({name:team}));
    var a = document.getElementById('strikeAudio');
        a.play()
    },
      
    'change #round':function(e){
     var currRound = gameSettings.findOne({name:'round'})._id;
   
    gameSettings.update({_id:currRound},{$set:{value:parseInt($(e.target).val())}});   
        
    }
      
  });
    
  Template.admin.helpers({
  currLeftStrikes:function(){
  
    var color = gameSettings.findOne({name:'leftHouse'}).value;
    
    
    return gameSettings.findOne({name:color}).strikes.length;
    
    
    
},
currRightStrikes:function(){
var color = gameSettings.findOne({name:'rightHouse'}).value;
    
    
    return gameSettings.findOne({name:color}).strikes.length;    
    
}      
      
      
});
    
Template.admin.rendered = function(){
    
 $("#rightHouse").val(gameSettings.findOne({name:'rightHouse'}).value);
 $("#leftHouse").val(gameSettings.findOne({name:'leftHouse'}).value)
    
    
}

Template.body.helpers({
isAdmin:function(){
    return Session.equals('isAdmin',true);
}
    
});
    
 Template.answers.helpers({
    
leftHouse: function(){ 
    return gameSettings.findOne({name:'leftHouse'}).value;
    

},
rightHouse: function(){ 

    return gameSettings.findOne({name:'rightHouse'}).value;
},
teamLX:function(){
    
    var color = gameSettings.findOne({name:'leftHouse'}).value;
    
    
    return gameSettings.findOne({name:color}).strikes;


},
teamRX:function(){


 var color = gameSettings.findOne({name:'rightHouse'}).value;
    
    
    return gameSettings.findOne({name:color}).strikes;



},
responses:function(){
    
var currRound = gameSettings.findOne({name:'round'}).value;  
return Surveys.findOne({round:currRound}).responses;
    
    
},
canShowAdmin:function(){

    
    
return (Session.get('mouseOverAdmin')&Session.get('isAdmin'));    
    
},
leftActive:function(){
    
return gameSettings.findOne({name:'activeTeam'}).value=='left';    
    
},
rightActive:function(){
    
return gameSettings.findOne({name:'activeTeam'}).value=='right';    
    
}
 
});
    
Template.answers.events({
'dblclick .answer':function(e,t){
    
var currSurvey = Surveys.findOne({_id:this.qid});
var responses = currSurvey.responses;
responses[(this.rank-1)].show=true;
Surveys.update({_id:this.qid},{$set:{responses:responses}});
var a = document.getElementById('bellAudio');
a.play()

var scoringSide = gameSettings.findOne({name:'activeTeam'}).value;
var scoringHouse = gameSettings.findOne({name:(scoringSide+'House')});
Scores.insert({
    
points:(responses.length - (this.rank-1)),
house:scoringHouse.value,
time:new Date(),
    
})
    
},
'mouseenter .answer':function(e){
    
Session.set('mouseOverAdmin',true);    
    
},
'mouseleave .answer':function(e){
    
Session.set('mouseOverAdmin',false);    
    
},
'dblclick #team1':function(e){
    
var activeSide = gameSettings.findOne({name:'activeTeam'})._id;
gameSettings.update({_id:activeSide},{$set:{value:'left'}});
    
},
'dblclick #team2':function(e){
    
var activeSide = gameSettings.findOne({name:'activeTeam'})._id;
gameSettings.update({_id:activeSide},{$set:{value:'right'}});
    
}
    
    
});
    
Template.questions.helpers({
    
questionText:  function(){
    

var currRound = gameSettings.findOne({name:'round'}).value;  
return Surveys.findOne({round:currRound}).question;   

}
    
});
    
Template.scores.helpers({
    
    redScore:function(){
        
     var points = Scores.find({house:'RED'})
     var total = 0;
     points.forEach(function(s){
     total+=s.points;     
         
     });
     return total;
        
    },
    blueScore:function(){
        
     var points = Scores.find({house:'BLUE'})
     var total = 0;
     points.forEach(function(s){
     total+=s.points;     
         
     });
     return total;
        
    },
     greenScore:function(){
        
     var points = Scores.find({house:'GREEN'})
     var total = 0;
     points.forEach(function(s){
     total+=s.points;     
         
     });
     return total;
        
    },
     yellowScore:function(){
        
     var points = Scores.find({house:'YELLOW'})
     var total = 0;
     points.forEach(function(s){
     total+=s.points;     
         
     });
     return total;
        
    }
    
});
    
}

if (Meteor.isServer) {
  Meteor.startup(function () {
      
  if(gameSettings.find().count()===0){
      
  gameSettings.insert({name:'RED',strikes:[],score:0,active:false})
  gameSettings.insert({name:'BLUE',strikes:[],score:0,active:false})
  gameSettings.insert({name:'GREEN',strikes:[],score:0,active:false})
  gameSettings.insert({name:'YELLOW',strikes:[],score:0,active:false})
  gameSettings.insert({name:'leftHouse',value:''})
  gameSettings.insert({name:'rightHouse',value:''})
  gameSettings.insert({name:'activeTeam',value:''});
  gameSettings.insert({name:'round',value:0});
      
  }
      
  if(Surveys.find().count()===0){
      
   Surveys.insert(round1);
   Surveys.insert(round2);
   Surveys.insert(round3);
   Surveys.insert(round4);
   Surveys.insert(round5);
   Surveys.insert(round6);
   Surveys.insert(round7);
   Surveys.insert(round8);
      
  }
  resetQuestions();    
  });
}

var round1 = {
round:1,
question:"What was the most popular CISSA sport?",
responses:[
    {text:"Soccer",percent:44,rank:1},
    {text:"Basketball",percent:29,rank:2},
    {text:"Floor Hockey",percent:16,rank:3},
    {text:"Badminton",percent:6,rank:4},
    {text:"Volleyball",percent:5,rank:5}
    
] 
}

var round2 = {

round:2,
question:"What is the least popular food ingredient at lunch?",
responses:[
    {text:"Vegetables",percent:48,rank:1},
    {text:"Fish",percent:17,rank:2},
    {text:"Rice",percent:14,rank:3},
    {text:"Chicken",percent:12,rank:4},
    {text:"Tofu",percent:9,rank:5}
    
] 
}

var round3 = {

round:3,
question:"What is the most popular M&M color?",
responses:[
    {text:"Blue",percent:36,rank:1},
    {text:"Red",percent:25,rank:2},
    {text:"Brown",percent:19,rank:3},
    {text:"Green",percent:11,rank:4},
    {text:"Yellow",percent:8,rank:5}
    
] 
}

var round4 = {

round:4,
question:"What do HIS students buy at the convenience store?",
responses:[
    {text:"Gatorade",percent:37,rank:1},
    {text:"Ice Cream",percent:32,rank:2},
    {text:"Chocolate",percent:22,rank:3},
    {text:"Milk Tea",percent:7,rank:4},
    {text:"Dried Fruit",percent:1,rank:5}
    
] 
}

var round5 = {

round:5,
question:"What are the top vacation spots for HIS students?",
responses:[
    {text:"United States",percent:39,rank:1},
    {text:"Thailand",percent:28,rank:2},
    {text:"Japan",percent:9,rank:3},
    {text:"Singapore",percent:8,rank:4},
    {text:"Fiji",percent:6,rank:5}
    
] 
}

var round6 = {

round:6,
question:"What are the favorite weekend activities for HIS students?",
responses:[
    {text:"Hang out",percent:29,rank:1},
    {text:"Sleep",percent:28,rank:2},
    {text:"Play Sports",percent:17,rank:3},
    {text:"Work on Computer",percent:5,rank:4},
    {text:"Play on Computer",percent:3,rank:5}
    
] 
}

var round7 = {

round:7,
question:"What are the most popular animals for pets?",
responses:[
    {text:"Dog",percent:76,rank:1},
    {text:"Hamster",percent:9,rank:2},
    {text:"Cat",percent:8,rank:3},
    {text:"Squirrel",percent:5,rank:4}
    
] 
}

var round8 = {

round:8,
question:"Which house had the best participation in this survey?",
responses:[
    {text:"Yellow",percent:31,rank:1},
    {text:"Blue",percent:27,rank:2},
    {text:"Green",percent:22,rank:3},
    {text:"Red",percent:20,rank:4}
    
] 
}

resetQuestions = function(){
var questions = Surveys.find();
questions.forEach(function(q){
    
var responses = q.responses;
responses.forEach(function(r){
    
r.show = false;
r.qid = q._id;
    
})

Surveys.update({_id:q._id},{$set:{responses:q.responses}});
    
})
      
}