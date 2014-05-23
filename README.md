multiget
========
multiget — [express](https://github.com/visionmedia/express) middleware that allow aggregate few api request into one response 

## Installation

    npm install multiget

## API

###multiget(apiHost) — creates middleware

## Example

```js
var express = require('express'),
    multiget = require('multiget'),
    app = express();

app.use(multiget('http://localhost:4000'));
app.listen(3000);
```

## Response format

Calling ```GET http://localhost:3000/api/multi?key1=api1&key2=api2```  for example above will made following requests:

    GET http://localhost:4000/api1
    GET http://localhost:4000/api2

and will combine responces into one:

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
