const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');
// const { validURL, validName } = require('./validation');
//const { TopologyDescriptionChangedEvent } = require('mongodb');

const ART_COLLECTION = "artwork";
const USER_COLLECTION = "users";
const MEDIUM_COLLECTION = "medium";
const COMMENTS_COLLECTION = "comments";
const CATEGORY_COLLECTION = "category";

const app = express();

//enable JSON data processing
app.use(express.json());

//enable CORS
app.use(cors());

const validURL = (str) => {
    if (str === "") {
        return false
    }

    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

const validName = (str) => {
    if (str === "") {
        return false
    } else if (str.trim().length < 4) {
        return false
    } else {
        return true
    }
}

const validDescription = (str) => {
    if (str === undefined || str === "") {
        return false
    } else {
        return true
    }
}


const validMedium = (str) => {
    if (str.length <= 0) {
        return false
    } else {
        return true
    }
}

const validCategory = (str) => {
    if (str) {
        return true
    } else {
        return false
    }
}

const validGender = (str) => {
    if (str === "") {
        return false
    } else if (str === 'male' || str === 'female') {
        return true
    } else {
        return false
    }
}

const validContactNumber = (str) => {
    let phoneno = /^\d{8}$/;
    if (str === "") {
        return false
    } else if (phoneno.test(str)) {
        return true
    }
    else {
        return false
    }
}

const validateEmail = (email) => {

    if (email === "") {
        return false
    } else if (/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true
    } else {
        return false
    }
};

const validatePassword = (str) => {
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (str.match(passw)) {
        return true
    }
    else {
        return false
    }
}

const validatePrice = (str) => {
    if (isNaN(str)) {
        return false
    } else if (str === "") {
        return false
    } else {
        return true
    }
}


async function main() {
    await MongoUtil.connect(process.env.MONGO_URI, "Art_space_db");

    app.get('/welcome', async function (req, res) {
        res.json({
            'message': "Welcome to my art space api!"
        })
    })

    //Create new user
    app.post('/create/user', async function (req, res) {
        try {
            let { name, sex, contact_no, specialise, email } = req.body
            contact_no = parseInt(contact_no);
            //must have name, sex, contact and email

            //check if the user exist or not 
            let checkDuplicate = {
                'email': email.trim()
            }
            let projection = {
                'projection': {
                    'email': 1
                }
            }
            let results = await MongoUtil.getDB().collection(USER_COLLECTION).find(checkDuplicate,
                projection).toArray();

            if (results.length !== 0) {
                res.status(302);
                res.json({
                    'message': "user record found"
                })
            } else {
                if (name.trim() !== "" && sex.trim() !== "" && email.trim() !== "") {
                    if (contact_no.length !== 8 && validateEmail(email)) {
                        sex = sex.trim().toLowerCase() === "male" ? "male" : (sex.trim().toLowerCase() === "female" ? "female" : 0);
                        //console.log(sex.trim().toLowerCase() === "male" ? "female" : "male");

                        if (sex) {
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
                            res.status(406);
                            res.json({
                                'message': "not acceptable, wrong sex info"
                            })
                        }

                    } else {
                        res.status(406);
                        res.json({
                            'message': "not acceptable"
                        })
                    }

                } else {
                    res.status(206)
                    res.json({
                        'message': "Content not sufficient"
                    })
                }
            }

        } catch (e) {

            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
        }
    })

    //Retrieve user information
    //retrieve particular user information 
    app.get('/retrieve/user', async function (req, res) {

        try {
            let name = req.query.name
            let criteria = {}
            if (name !== undefined && name.trim() !== "") {
                criteria = {
                    name
                }
            }

            let results = await MongoUtil.getDB().collection(USER_COLLECTION).find(criteria).toArray();
            res.status(200);
            res.json({
                'users': results
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error"
            })
        }
    })


    //Edit user information
    //require params
    app.put('/edit/user/:id', async function (req, res) {
        try {
            let { name, sex, contact_no, specialise, email } = req.body
            contact_no = parseInt(contact_no);
            //must have name, sex, contact and email

            //check if the user exist or not 
            let checkDuplicate = {
                'email': email.trim()
            }
            let projection = {
                'projection': {
                    'email': 1
                }
            }
            let results = await MongoUtil.getDB().collection(USER_COLLECTION).find(checkDuplicate,
                projection).toArray();
            if (results.length !== 0) {
                res.status(302);
                res.json({
                    'message': "user record found"
                })
            } else {
                if (name.trim() !== "" && sex.trim() !== "" && email.trim() !== "") {
                    if (contact_no.length !== 8 && validateEmail(email)) {
                        sex = sex.trim().toLowerCase() === "male" ? "male" : (sex.trim().toLowerCase() === "female" ? "female" : 0);

                        if (sex) {
                            specialise = specialise.split(',');

                            specialise = specialise.map(function (each_sp_item) {
                                return each_sp_item.trim();
                            })
                            // console.log(specialise);

                            const db = MongoUtil.getDB();
                            await db.collection(USER_COLLECTION).updateOne({
                                '_id': ObjectId(req.params.id)
                            }, {
                                '$set': {
                                    name,
                                    sex,
                                    contact_no,
                                    specialise,
                                    email
                                }
                            })
                            res.status(200);
                            res.json({
                                'message': "The user record has been updated successfully"
                            })
                        } else {
                            res.status(406);
                            res.json({
                                'message': "not acceptable, wrong sex info"
                            })
                        }

                    } else {
                        res.status(406);
                        res.json({
                            'message': "not acceptable"
                        })
                    }

                } else {
                    res.status(206)
                    res.json({
                        'message': "Content not sufficient"
                    })
                }
            }

        } catch (e) {
            res.status(500);
            res.json({
                'message': "internal server error"
            })
        }
    })
    //Delete user information
    app.delete('/delete/user/:id', async function (req, res) {
        try {
            await MongoUtil.getDB().collection(USER_COLLECTION).deleteOne()
        } catch {
            res.status(500);
            res.json({
                'message': "Internal server error"
            })
        }
    })


    //Create Artwork API (done for first stage)
    app.post('/create/art/post', async function (req, res) {
        try {

            let { image_link,
                name,
                description,
                category,
                medium,
                artist,
                password,
                price, } = req.body;

            // medium = medium.split(',');
            medium = medium.map(function (each_medium) {
                return each_medium.trim();
            })

            if (validURL(image_link) &&
                validName(name) &&
                validDescription(description) &&
                validCategory(category) &&
                validMedium(medium) &&
                validName(artist.name) &&
                validGender(artist.sex) &&
                validContactNumber(artist.contact_no) &&
                validateEmail(artist.email) &&
                validatePassword(password) &&
                validatePrice(price)
            ) {
                // console.log("it works")

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
                    "last_time_stamp": new Date()
                });

                res.status(200);
                res.json({
                    'message': "The artwork record has been added successfully"
                })
            } else {
                res.status(400);
                res.json({
                    'message': "Bad request"
                })
            }
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
    //And query artwork by price greater equal than or lower equal than
    app.get('/retrieve/artwork', async function (req, res) {
        try {
            let criteria = {};
            // console.log(req.query.priceGte);
            // console.log(req.query.medium);
            // console.log(req.query.category);

            // if (req.query.medium) {
            //     criteria['medium'] = {
            //         '$regex': req.query.medium,
            //         '$options': 'i'    //not case sensitive 
            //     }
            // }

            if (req.query.medium) {
                criteria['medium'] = {
                    '$all': req.query.medium
                }
            }

            if (req.query.category) {
                criteria['category'] = {
                    '$regex': req.query.category
                }
            }
            let priceGte = parseInt(req.query.priceGte);
            let priceLte = parseInt(req.query.priceLte);


            if (priceGte) {
                criteria['price'] = {
                    "$gte": priceGte
                }
            }

            if (priceLte) {
                criteria['price'] = {
                    "$lte": priceLte
                }
            }

            let results = await MongoUtil.getDB().collection(ART_COLLECTION).find(criteria).toArray();
            res.status(200);
            res.json({
                'art_space': results
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    app.get('/search/artwork', async function (req, res) {
        try {
            let db = MongoUtil.getDB();
            db.collection(ART_COLLECTION).createIndex({ name: "text", description: "text" });
            let results = await db.collection(ART_COLLECTION).find({
                $text: {
                    $search: req.query.searchText.toLowerCase()
                }
            }, {
                score: {
                    $meta: "textScore"
                }
            }).toArray();
            res.status(200);
            res.json({
                'art_space': results
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    //Update artwork
    app.put('/update/artwork/:id', async function (req, res) {
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
            // medium = medium.split(',');
            medium = medium.map(function (each_medium) {
                return each_medium.trim();
            })

            if (validURL(image_link) &&
                validName(name) &&
                validDescription(description) &&
                validCategory(category) &&
                validMedium(medium) &&
                validName(artist.name) &&
                validGender(artist.sex) &&
                validContactNumber(artist.contact_no) &&
                validateEmail(artist.email) &&
                validatePassword(password) &&
                validatePrice(price)){

                await MongoUtil.getDB().collection(ART_COLLECTION).updateOne({
                    '_id': ObjectId(req.params.id)
                }, {
                    // $currentDate: {
                    //     "last_time_stamp": true
                    //     //{ $type: "timestamp" }
                    // },
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
                        price,
                        "last_time_stamp": new Date()
                    }
                })
            res.status(200);
            res.json({
                'message': 'Artwork updated successfully'
            })
        }else{
            res.status(400)
            res.json({
                'message': "bad request"
            })
        }

        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e);
        }
    })

    //delete artwork 
    //Need the object id and password to delete artwork
    //how to do projection for delete???
    app.delete('/delete/artwork/:id/:password', async function (req, res) {

        try {
            let results = await MongoUtil.getDB().collection(ART_COLLECTION).find({
                '_id': ObjectId(req.params.id)
            }, {
                'projection': {
                    'password': 1
                }
            }).toArray();


            if (results[0].password === req.params.password) {
                await MongoUtil.getDB().collection(ART_COLLECTION).deleteOne({
                    '_id': ObjectId(req.params.id)
                })
                let idResult = await MongoUtil.getDB().collection(COMMENTS_COLLECTION).find({
                    'artwork_id': ObjectId(req.params.id)
                }, {
                    'projection': {
                        '_id': 1
                    }
                }).toArray();
                // console.log(idResult);
                // console.log(idResult[0]);
                // console.log(idResult[0]._id);
                let newResult = []
                for (let x of idResult) {
                    newResult.push(x._id)
                }
                // console.log(newResult);
                await MongoUtil.getDB().collection(COMMENTS_COLLECTION).deleteMany({
                    '_id': {
                        $in: newResult
                    }
                })
                res.status(200);
                res.json({
                    'message': "The document has been deleted"
                })

            } else {
                res.status(401);
                res.json({
                    'message': "Unauthorized"
                })
            }
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
            console.log(e)
        }
    })

    app.get('/retrieve/password/:id/:password', async function (req, res) {
        try {
            let results = await MongoUtil.getDB().collection(ART_COLLECTION).find({
                '_id': ObjectId(req.params.id)
            }, {
                'projection': {
                    'password': 1
                }
            }).toArray();

            if (req.params.password === results[0].password) {
                res.status(200);
                res.json({
                    'result': Boolean(true)
                })
            } else {
                res.status(204);
                res.json({
                    'result': Boolean(false),
                    'message': "wrong password"
                })
            }
        } catch (e) {
            res.status(500);
            res.json({
                'message': 'Internal server error. PLease contact administrator'
            })
            console.log(e)
        }
    })

    //Create medium 
    app.post('/create/medium', async function (req, res) {
        let { name, code_type } = req.body;
        try {
            if (name && code_type) {
                await MongoUtil.getDB().collection(MEDIUM_COLLECTION).insertOne({
                    name,
                    code_type
                })
                res.status(200);
                res.json({
                    'message': "The medium record has been added successfully"
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

    //Retrieve medium
    app.get('/retrieve/medium/:id', async function (req, res) {
        try {
            let id = req.params.id;
            if (id !== "" && id !== undefined) {

                let criteria = {
                    '_id': ObjectId(id)
                }

                let results = await MongoUtil.getDB().collection(MEDIUM_COLLECTION).find(criteria).toArray();

                res.status(200);
                res.json({
                    'medium': results
                })
            } else {
                res.status(206);
                res.json({
                    'message': "content not sufficient"
                })
            }

        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error"
            })
        }
    })


    //Retrieve medium without id
    app.get('/retrieve/medium', async function (req, res) {
        try {

            let criteria = {};

            let results = await MongoUtil.getDB().collection(MEDIUM_COLLECTION).find(criteria).toArray();

            res.status(200);
            res.json({
                'medium': results
            })

        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error"
            })
        }
    })

    //Create comments
    app.post('/create/comment', async function (req, res) {
        try {
            let { name, artwork_id, comment } = req.body;

            if (name.trim() !== "" && name !== undefined && artwork_id.trim() !== "") {
                await MongoUtil.getDB().collection(COMMENTS_COLLECTION).insertOne({
                    name,
                    "artwork_id": ObjectId(artwork_id),
                    comment,
                    "last_time_stamp": new Date()
                });
                res.status(200);
                res.json({
                    'message': "comment added successfully"
                })
            } else {
                res.status(206);
                res.json({
                    'message': "No content, please input content"
                })
            }

        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
        }
    })

    //retrieve comments base on artwork_id
    app.get('/retrieve/comment', async function (req, res) {
        try {
            let criteria = {};
            // console.log(req.query.id);

            if (req.query.id) {
                criteria = {
                    "artwork_id": ObjectId(req.query.id)
                }
            }

            let results = await MongoUtil.getDB().collection(COMMENTS_COLLECTION).find(criteria).toArray();
            res.status(200);
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

    //update comments base on the comment object id 
    //may need to remove the artwork id
    //Need to adjust the last_time_stamp
    app.put('/edit/comment/:id', async function (req, res) {
        try {
            let { comment } = req.body;
            await MongoUtil.getDB().collection(COMMENTS_COLLECTION).updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                $currentDate: {
                    "last_time_stamp": true
                },
                $set: {
                    comment
                }
            })
            res.status(200)
            res.json({
                'message': 'comment been updated'
            })
        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
        }
    })


    //delete comments base on the comment object id 
    app.delete('/delete/comment', async function (req, res) {
        try {
            await MongoUtil.getDB().collection(COMMENTS_COLLECTION).deleteOne({
                '_id': ObjectId(req.params.id)
            })
            res.status(200);
            res.json({
                'message': 'The document has been deleted'
            })

        } catch (e) {
            res.status(500);
            res.json({
                'message': "Internal server error. Please contact administrator"
            })
        }
    })

    //retrieve category information
    app.get('/retrieve/category', async function (req, res) {
        try {
            let criteria = {}
            let results = await MongoUtil.getDB().collection(CATEGORY_COLLECTION).find(criteria).toArray();
            res.status(200);
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

}

main();

//process.env.PORT
app.listen(process.env.PORT, function () {
    console.log("Server has started")
})



