const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
const { TopologyDescriptionChangedEvent } = require('mongodb');


//const COLLECTION_NAME=
const ART_COLLECTION = "artwork";
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
            } else {
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

            //let last_time_stamp = new Date(req.body.last_time_stamp);
            let curr = new Date();
            let currDate = curr.getFullYear()+"-"+curr.getDate()+"-"+curr.getDay();
            medium = medium.split(',');
            medium = medium.map(function (each_medium) {
                return each_medium.trim();
            })

            //Need to implement a find query of the user and add it into the create
            // or don need
            const db = MongoUtil.getDB();


            let results = await MongoUtil.getDB().collection(ART_COLLECTION).insertOne({
                image_link,
                name,
                description,
                category,
                medium,
                "artist": {
                    "name": artist.name,
                    "sex": artist.sex,
                    "contact_no": artist.contact_no,
                    "email": artist.email
                },
                password,
                price,
                "last_time_stamp":  currDate
            });

            res.status(200);
            res.json({
                'message': "The artwork record has been added successfully"
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e);
        }
    })

    //Get all posting 
    //And get by medium
    app.get('/retrieve_artwork', async function (req, res) {
        try {
            let criteria = {};

            if (req.query.medium) {
                criteria['medium'] = {
                    '$regex': req.query.medium,
                    '$options': 'i'    //not case sensitive 
                }
            }
            let results = await MongoUtil.getDB().collection(ART_COLLECTION).find(criteria).toArray();
            res.json({
                'art_space': results
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
        }
    })

    //Update artwork
    app.put('/update_artwork/:id', async function (req, res) {
        try {
            let { image_link,
                name,
                description,
                category,
                medium,
                artist,
                password,
                price, } = req.body;

            //let last_time_stamp = new Date(req.body.last_time_stamp);
            medium = medium.split(',');
            medium = medium.map(function (each_medium) {
                return each_medium.trim();
            })

            await MongoUtil.getDB().collection(ART_COLLECTION).updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                $currentDate: {
                    "last_time_stamp": true 
                    //{ $type: "timestamp" }
                },
                $set: {
                    image_link,
                    name,
                    description,
                    category,
                    medium,
                    "artist": {
                        "name": artist.name,
                        "sex": artist.sex,
                        "contact_no": artist.contact_no,
                        "email": artist.email
                    },
                    password,
                    price
                }
            })
            res.status(200);
            res.json({
                'message': 'Artwork updated successfully'
            })

        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e);
        }
    })

}

main();


app.listen(3000, function () {
    console.log("Server has started")
})



