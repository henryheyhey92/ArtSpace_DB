const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const { TopologyDescriptionChangedEvent } = require('mongodb');


//const COLLECTION_NAME=
const ART_COLLECTION = "art_space";
const USER_COLLECTION = "users";

const app = express();

//enable JSON data processing
app.use(express.json());

//enable CORS
app.use(cors());

async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "Art_space_db");

    app.get('/welcome', async function (req, res) {
        res.json({
            'message': "Welcome to my art space api!"
        })
    })

    //Create new user
    app.post('/create_user', async function (req, res) {
        try {
            let { name, sex, contact_no, specialise, email } = req.body

            //must have name, sex, contact and email
            if (name && sex && contact_no && email) {
                specialise = specialise.split(',');

                specialise = specialise.map(function (each_sp_item) {
                    return each_sp_item.trim();
                })


                const db = MongoUtil.getDB();
                await db.collection(USER_COLLECTION).insertOne({
                    name,
                    sex,
                    contact_no,
                    specialise,
                    email
                })
                res.status(200);
                res.json({
                    'message': "The user record has been added successfully"
                })
            }else{
                res.status(206)
                res.json({
                    'message': "Content not sufficient"
                })
            }


        } catch (e) {

            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
        }
    })


    app.post('/create_art_post', async function (req, res) {
        try {
            
            let { image_link,
                name,
                description,
                category,
                medium,
                artist,
                password,
                price, } = req.body;

                let last_time_stamp = new Date(req.body.last_time_stamp);
                medium = medium.split(',');
                medium = medium.map(function(each_medium){
                    return each_medium.trim();
                })

            //Need to implement a find query of the user and add it into the create
            // or don need
            const db = MongoUtil.getDB();
            console.log(medium)

            let results = await MongoUtil.getDB().collection(ART_COLLECTION).insertOne({
                image_link,
                name,
                description,
                category,
                medium,
                "artist": {
                    "name" : artist.name,
                    "sex" : artist.sex,
                    "contact_no" : artist.contact_no,
                    "email" : artist.email
                },
                password,
                price,
                last_time_stamp
            });

            res.status(200);
            res.json({
                'message': "The artwork record has been added successfully"
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact adminstrator"
            })
            console.log(e);
        }
    })

}

main();


app.listen(3000, function () {
    console.log("Server has started")
})



