# Art space Express RESTFUL API, Project - 02

This is the Art Space SG project built with Express.js. and MongoDB for Project 2. 
The front-end react project can be found [https://github.com/henryheyhey92/Art-Space](https://github.com/henryheyhey92/Art-Space)

# Index

1. [Context](#1-context)
2. [Document Design](#2-Database-document-design)
3. [Technologies Used](#3-technologies-used)
4. [Acknowledgements](#4-acknowledgements)

# 1. Context

This is a custom API built for the [Art Space SG](https://endearing-sopapillas-ef68c6.netlify.app/) project (The project application link). The project is for purpose of create, read, update and delete of information related to artwork done by artist in sg. The application is built with [MongoDB](https://www.mongodb.com/) and [Express.js](https://expressjs.com/) 



# 2. Database document design


The database has total of 5 collection (only 4 of the collection are in use now). The RESTFUL api are written in the index.js file. The first collection is artwork that contains information on the art pieces done by the artist and CRUD operation is supported this collection. The second collection is comments, it allows user to store comments information to the database. CRUD operation are written for this collection, but only the CRD is in use for the front end. The 3rd and 4th collection are category and mediums. Both collection perform are for read operator only. The users collections have all CRUD operation. However, the users collection will only be applied for future implementation.


# 3. Technologies Used

- [Express.js](https://expressjs.com/)

  This API uses Express .js, a fast, unopinionated, minimalist web framework for Node.js

- [MondoDB](https://www.mongodb.com/)

  This API uses MongoDB, a document-oriented database.


# 4. Acknowledgements

stackoverflow community and Paul's tutorials code have helped on the development of the project.