# sequelize-compass

Sequelize-compass is admin tool for Sequelize ORM >= 2.X. Is supports most of Sequlize supported DataTypes and all three common association cases. Sequelize-compass allows you to edit your database not just as fields and rows, but as Sequelize-defined model instances, managing their attributes and associating them between each other.

Sequelize-compass is highly inspired by Django admin interface.

**Sequelize-compass is in deep alfa and not ready for production use.**

## Installation

`npm install sequelize-compass`

### Dependencies

* Express 3.x/4.x
* Sequelize >= 2.X with mysql/pg driver

### Supported attribute types

* STRING (and TEXT)
* INTEGER
* TIMESTAMP WITH TIME ZONE
* INTEGER[] for PostgreSQL
* BOOLEAN
* ENUM

### Supported association types

* hasOnce
* hasMany
* belongsTo

### Usage

In server.js/app.js after Express app object initialization, call sequlize-compass:

```
... // Express app init

var sequelizeCompass = require("sequelize_compass");

sequelizeCompass(adminURL, appObject, compassConfig, modelsArray);
```

Sequlize-compass will add all requires URLs to you Express app and can be reached at http://youapp/:adminURL

#### Options

* adminURL - string, a URL for your admin interface. Can be `"/admin"` or smth like `"/mysecretadmin"`
* appObject — object, a main `app` object of your Express instance. Usually can be initiated as:

```
var express = require("express")
var app = express();
```

* compassConfig - object, Sequlize-compass config with all models, attributes and associations that should be served by Sequelize-compass. Described in details below.
* modelsArray — array, an array of all Sequelize model classes, usually got with `var User = sequelize.define("User", {...});`

#### compassConfig object

compassConfig — is a main config object, with the help of which Sequlize-compass builds it's admin panel schema. Example structure:

```
var compassConfig =  {
    models: [
        {
            modelName: "Author",
            attributes: ["id", "name", "booksWrote", "photoUrl"],
            pKey: ["id"],
            associations: [
                {
                    type: "belongsTo",
                    model: "Person",
                    attributes: ["id", "name", "phone", "salary"],
                    as: "Agent",
                },
                {
                    type: "hasMany",
                    model: "Book",
                    attributes: ["id", "title", "cover", "publicationDate"],
                    as: "BooksIWrote",
                    through : "AuthorBooks" // junction table defined in Model definition. Not actually used, but shown as a tip.
                },
                ... // next association definition for model Author goes here
            }]
        },
        ... // next model definition goes here
    ]
}
```

##### Why should I describe all theese atributes and associations in compassConfig object? Can Sequelize-compass just grab this data from model classes? It's so hard to maintain!

Definately, yes. At first look it may seem easier. However, there are at least two reasons, why you must define what to serve manually:

1. Sequelize define hasMany and belongsTo associations as regular attributes, so they will be shown in attributes list. There is no 100% guaranted way to determine if a particular attribute is a user-defined field, or it's Sequelize-generated association flag. In future, I'll try to avoid this, comparing names of fields with names of hasOne/belongsTo associations to extract Sequelize-generated association fields (first-look thoughts), but now it's better to define attributes evidently.
2. Your models may contain long/tech-generated data which usually is not need to be modified or shown. For example, in User model you may have passwordHash(1024) field or salt(512). I do suppose it's better to have ability not to touch such fields at all.

### Dev notes

Sequelize-compass was originally written in CoffeeScript, but now it migrates to pure JS. So, trying to build /src folder will raise a lot for bugs — /src contains a lot of old code, I store it because of comments. In near future I'll beutify JS-version, move all comments to it and delete CoffeeScript-one.

### LICENSE

(C) 2014 MIT standard license