gameSettings = new Meteor.Collection('settings');
Surveys = new Meteor.Collection('surveys');
Scores = new Meteor.Collection('scores');

if (Meteor.isClient) {
    // counter starts at 0


    Session.setDefault('isAdmin', true);

    Template.admin.events({

        'change .houseSelect': function (e) {
            var house = $(e.target).prop("id");

            var currSide = gameSettings.findOne({ name: house });
            console.log(currSide);
            gameSettings.update({ _id: currSide._id }, { $set: { value: $(e.target).val() } });

        },
        'change .strikes': function (e) {

            var team = $(e.target).prop("id").split('?')[0];
            var currSide = gameSettings.findOne({ name: team });
            var currTeam = gameSettings.findOne({ name: currSide.value });
            var array = [];
            for (var i = 0; i < $(e.target).val(); i++) {
                array.push('');

            }

            gameSettings.update({ _id: currTeam._id }, { $set: { strikes: array } });
            console.log(gameSettings.findOne({ name: team }));
            if ($(e.target).val() > currTeam.strikes.length) {
                var a = document.getElementById('strikeAudio');
                a.play()
            }
        },

        'change #round': function (e) {
            var currRound = gameSettings.findOne({ name: 'round' })._id;

            gameSettings.update({ _id: currRound }, { $set: { value: parseInt($(e.target).val()) } });

        },
        'click #walk-on': function (e) {
            e.preventDefault();
            var a = document.getElementById('walkAudio');
            a.currentTime = 0;
            a.play()

        },
        'click #background': function (e) {
            e.preventDefault();
            var a = document.getElementById('backgroundAudio');
            a.currentTime = 0;
            a.play()

        },
        'click #stop-music': function (e) {
            e.preventDefault();
            var a = document.getElementById('walkAudio');
            a.pause()
            var a = document.getElementById('backgroundAudio');
            a.pause()
        },
        'click #resetGame': function (e) {
            e.preventDefault();
            var sure = confirm("Are you sure you want to reset the game?");
            if (sure) {
                resetQuestions();
                Scores.find().forEach(function (s) {

                    Scores.remove({ _id: s._id });
                });
            }

        }

    });

    Template.admin.helpers({
        currLeftStrikes: function () {

            var color = gameSettings.findOne({ name: 'leftHouse' }).value;


            return gameSettings.findOne({ name: color }).strikes.length;



        },
        currRightStrikes: function () {
            var color = gameSettings.findOne({ name: 'rightHouse' }).value;


            return gameSettings.findOne({ name: color }).strikes.length;

        }


    });

    Template.admin.rendered = function () {

        $("#rightHouse").val(gameSettings.findOne({ name: 'rightHouse' }).value);
        $("#leftHouse").val(gameSettings.findOne({ name: 'leftHouse' }).value)


    }

    Template.body.helpers({
        isAdmin: function () {
            return Session.equals('isAdmin', true);
        }

    });

    Template.answers.helpers({

        leftHouse: function () {
            return gameSettings.findOne({ name: 'leftHouse' }).value;


        },
        rightHouse: function () {

            return gameSettings.findOne({ name: 'rightHouse' }).value;
        },
        teamLX: function () {

            var color = gameSettings.findOne({ name: 'leftHouse' }).value;


            return gameSettings.findOne({ name: color }).strikes;


        },
        teamRX: function () {


            var color = gameSettings.findOne({ name: 'rightHouse' }).value;


            return gameSettings.findOne({ name: color }).strikes;



        },
        responses: function () {

            var currRound = gameSettings.findOne({ name: 'round' }).value;
            return Surveys.findOne({ round: currRound }).responses;


        },
        canShowAdmin: function () {



            return (Session.get('mouseOverAdmin') & Session.get('isAdmin'));

        },
        leftActive: function () {

            return gameSettings.findOne({ name: 'activeTeam' }).value == 'left';

        },
        rightActive: function () {

            return gameSettings.findOne({ name: 'activeTeam' }).value == 'right';

        }

    });

    Template.answers.events({
        'dblclick .answer': function (e, t) {
            if (Session.get('isAdmin')) {
                var currSurvey = Surveys.findOne({ _id: this.qid });
                var responses = currSurvey.responses;
                responses[(this.rank - 1)].show = true;
                Surveys.update({ _id: this.qid }, { $set: { responses: responses } });
                var a = document.getElementById('bellAudio');
                a.play()

                var scoringSide = gameSettings.findOne({ name: 'activeTeam' }).value;
                var scoringHouse = gameSettings.findOne({ name: (scoringSide + 'House') });
                Scores.insert({

                    points: (responses.length - (this.rank - 1)),
                    house: scoringHouse.value,
                    time: new Date(),

                })
            }

        },
        'mouseenter .answer': function (e) {

            Session.set('mouseOverAdmin', true);

        },
        'mouseleave .answer': function (e) {

            Session.set('mouseOverAdmin', false);

        },
        'dblclick #team1': function (e) {

            var activeSide = gameSettings.findOne({ name: 'activeTeam' })._id;
            gameSettings.update({ _id: activeSide }, { $set: { value: 'left' } });

        },
        'dblclick #team2': function (e) {

            var activeSide = gameSettings.findOne({ name: 'activeTeam' })._id;
            gameSettings.update({ _id: activeSide }, { $set: { value: 'right' } });

        }


    });

    Template.questions.helpers({

        questionText: function () {


            var currRound = gameSettings.findOne({ name: 'round' }).value;
            return Surveys.findOne({ round: currRound });//.question;

        }
    });

    Template.scores.helpers({

        redScore: function () {

            var points = Scores.find({ house: 'RED' })
            var total = 0;
            points.forEach(function (s) {
                total += s.points;

            });
            return total;

        },
        blueScore: function () {

            var points = Scores.find({ house: 'BLUE' })
            var total = 0;
            points.forEach(function (s) {
                total += s.points;

            });
            return total;

        },
        greenScore: function () {

            var points = Scores.find({ house: 'GREEN' })
            var total = 0;
            points.forEach(function (s) {
                total += s.points;

            });
            return total;

        },
        orangeScore: function () {

            var points = Scores.find({ house: 'ORANGE' })
            var total = 0;
            points.forEach(function (s) {
                total += s.points;

            });
            return total;

        }

    });

}

if (Meteor.isServer) {
    Meteor.startup(function () {
        
        // var globalObject = Meteor.isClient ? window : global;
        // for (var property in globalObject) {
        //     var object = globalObject[property];
        //     if (object instanceof Meteor.Collection) {
        //         object.remove({});
        //     }
        // }

        if (gameSettings.find().count() === 0) {

            gameSettings.insert({ name: 'RED', strikes: [], score: 0, active: false })
            gameSettings.insert({ name: 'BLUE', strikes: [], score: 0, active: false })
            gameSettings.insert({ name: 'GREEN', strikes: [], score: 0, active: false })
            gameSettings.insert({ name: 'ORANGE', strikes: [], score: 0, active: false })
            gameSettings.insert({ name: 'leftHouse', value: '' })
            gameSettings.insert({ name: 'rightHouse', value: '' })
            gameSettings.insert({ name: 'activeTeam', value: '' });
            gameSettings.insert({ name: 'round', value: 0 });

        }

        if (Surveys.find().count() === 0) {

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
    round: 1,
    question: "Date Night Ideas?",
    subtext: "(other than dinner and a movie)",
    responses: [
        { text: "Walk/Hike", percent: 19, rank: 1 },
        { text: "Concert/Theater", percent: 14, rank: 2 },
        { text: "Games/Board Games", percent: 12, rank: 3 },
        { text: "Shopping", percent: 10, rank: 4 },
        { text: "Temple", percent: 8, rank: 5 }

    ]
}

var round2 = {

    round: 2,
    question: "Things to teach kids?",
    subtext: "(so they will love each other)",
    responses: [
        { text: "Service", percent: 42, rank: 1 },
        { text: "Be Kind/Speak Kindly", percent: 18, rank: 2 },
        { text: "Compassion/Empathy", percent: 10, rank: 3 },
        { text: "Patience", percent: 6, rank: 4 },
        { text: "Working Together", percent: 6, rank: 5 }

    ]
}

var round3 = {

    round: 3,
    question: "Ways to serve family members?",
    subtext: "",
    responses: [
        { text: "Help w/ something", percent: 20, rank: 1 },
        { text: "Cook/Make Dinner", percent: 17, rank: 2 },
        { text: "Be there for them", percent: 15, rank: 3 },
        { text: "Do their chores", percent: 10, rank: 4 },
        { text: "Nice Notes", percent: 8, rank: 5 }

    ]
}

var round4 = {

    round: 4,
    question: "What do men want in a relationship?",
    subtext: "",
    responses: [
        { text: "Best Friend/Companion", percent: 23, rank: 1 },
        { text: "Mutual Love", percent: 21, rank: 2 },
        { text: "Support", percent: 17, rank: 3 },
        { text: "Attention", percent: 16, rank: 4 },
        { text: "Respect", percent: 14, rank: 5 }

    ]
}

var round5 = {

    round: 5,
    question: "What do women want in a relationship?",
    subtext: "",
    responses: [
        { text: "Love", percent: 26, rank: 1 },
        { text: "Best Friend/Companion", percent: 20, rank: 2 },
        { text: "Fun/Laughter", percent: 16, rank: 3 },
        { text: "Supportive Spouse", percent: 14, rank: 4 },
        { text: "Respect", percent: 13, rank: 5 }

    ]
}

var round6 = {

    round: 6,
    question: "Family night ideas?",
    subtext: "(other than lesson/game)",
    responses: [
        { text: "Family/Church movie", percent: 22, rank: 1 },
        { text: "Cooking/Baking", percent: 21, rank: 2 },
        { text: "Bowling/Hiking/Biking", percent: 20, rank: 3 },
        { text: "Going out for Desert", percent: 11, rank: 4 },
        { text: "Service", percent: 8, rank: 5 }

    ]
}

var round7 = {

    round: 7,
    question: "Ways to show someone you love them?",
    subtext: "",
    responses: [
        { text: "Do something/help/serve", percent: 35, rank: 1 },
        { text: "Affection", percent: 25, rank: 2 },
        { text: "Tell them", percent: 18, rank: 3 },
        { text: "Listen & follow through", percent: 10, rank: 4 },
        { text: "Bring them a gift", percent: 8, rank: 5 }
    ]
}

var round8 = {

    round: 8,
    question: "What makes you want to come home?",
    subtext: "",
    responses: [
        { text: "Family/Spouse", percent: 38, rank: 1 },
        { text: "Comfort,Quiet,Peace", percent: 12, rank: 2 },
        { text: "Love,Happiness", percent: 12, rank: 3 },
        { text: "Good Meal", percent: 4, rank: 4 },
        { text: "Clean House", percent: 4, rank: 5 }
    ]
}

resetQuestions = function () {
    var questions = Surveys.find();
    questions.forEach(function (q) {

        var responses = q.responses;
        responses.forEach(function (r) {

            r.show = false;
            r.qid = q._id;

        })

        Surveys.update({ _id: q._id }, { $set: { responses: q.responses } });

    })

}