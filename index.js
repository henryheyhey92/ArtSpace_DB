const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');

const db = MongoUtil.getDB();

//const COLLECTION_NAME=

//setup
const app = express();

//enable JSON data processing
app.use(express.json());

//enable CORS
app.use(cors());

async function main(){
    await MongoUtil.connect(process.env.MONGO_URI, "Art_space_db");

    app.get('/welcome', async function(req,res){
        res.json({
            'message':"Welcome to my art space api!"
        })
    })

    //Create new user
    app.post('/create_user', async function(req, res){
        try{

            let {name, sex, contact_no, specialise, email} = req.body
            await db.collection(ART_COLLECTION).insertOne({
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
        }catch (e){
            
            res.status(500);
            res.json({
                'message':"Internal server error. Please contact administrator"
            })
        }
    })
    

    app.post('/create_art_post', async function(req,res){
        try{
            let {image_link, 
                name, 
                description, 
                category, 
                medium_id, 
                artist, 
                password, 
                price, last_time_stamp} = req.body;

            let results = await MongoUtil.getDB().collection(ART_COLLECTION).insertOne({
                image_link,
                description,
                category,
                medium_id,
                artist,
                password,
                price,
                last_time_stamp
            });

            res.status(500);
            res.json({
                'message':"The artwork record has been added successfully"
            })
        }catch(e){
            res.status(500);
            res.json({
                'message':"Internal server error. Please contact adminstrator"
            })
            console.log(e);
        }
    })

}

main();


app.listen(3000, function () {
    console.log("Server has started")
})



