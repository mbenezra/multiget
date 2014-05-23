multiget
========
multiget — [express](https://github.com/visionmedia/express) middleware that allow aggregate few api request into one response 

## Installation

    npm install multiget

## API

###multiget(<api host>) — creates middleware

## Example

```js
var express = require('express'),
    multiget = require('multiget'),
    app = express();

app.use(multiget('http://localhost:3001'));
app.listen(3000);
```

## Response format

for query ```api/multi?key1=api1&key2=api2```  responce will:

```js
{
    key1: {
        result: /*api responce*/,
        error: /*error message*/
    },
    key2: {
        result: /*api responce*/,
        error: /*error message*/
    }
}
```

fields ```error``` and ```result``` are mutually exclusive
