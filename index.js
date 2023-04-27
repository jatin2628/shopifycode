const crypto = require('crypto');
const nonce = require('nonce')();
const request = require('request-promise');
const querystring = require('querystring');
const cookie = require('cookie');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = process.env;

const app = express();

const apiKey = SHOPIFY_API_KEY;

const apisecret = SHOPIFY_API_SECRET;

const scopes ="read_themes, write_themes";

const forwardingaddress ="https://074c-223-178-210-10.ngrok-free.app";


app.get('/shopify', (req, res) => {

    // const shop = req.query.shop;
    const shop = 'jtstore2.myshopify.com';
    if (shop) {
        const state = nonce();
        const redirectURL = forwardingaddress+'/shopify/callback';
        const shopifyURL = 'https://'+shop+'/admin/oauth/authorize?client_id='+apiKey+'&scope='+scopes+'&state='+state+'&redirect_uri='+redirectURL;

        res.cookie('state', state);

        res.redirect(shopifyURL);



} else {

    return res.status(400).send('Missing "Shop Name" parameter!! please add');

}

});

app.get('/shopify/callback', (req, res) => {

    const { shop, hmac, code, shopState } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).shopState;

    if (shopState !== stateCookie) {

        return res.status(400).send("request origin cannot be found")

    }

    if (shop && hmac && code) {

        const Map = Object.assign({}, req.query);

        delete Map['hmac'];



        const message = querystring.stringify(Map);

        const generatehmac = crypto.createHmac('sha256', apisecret).update(message).digest('hex');



        console.log(generatehmac)



        if (generatehmac !== hmac) {

            return res.status(403).send("validation failed")



        }



        const accessTokenRequestUrl = 'https://'+shop+'/admin/oauth/access_token';

            const accessTokenPayload = {

                client_id: apiKey,

                client_secret: apisecret,

                code,

            };



        request.post(accessTokenRequestUrl, { json: accessTokenPayload })

            .then((accessTokenResponse) => {

                const accessToken = accessTokenResponse.access_token;

                const apiRequestURL = 'https://' + shop + '/admin/shop.json';

                    const apiRequestHeaders =

                        {

                        'X - Shopify - Access - Token': accessToken

            };

        request.get(apiRequestURL, { headers: apiRequestHeaders })

            .then((apiResponse) => {

                res.end(apiResponse);

            })

            .catch((error) => {

                res.status(error.statusCode).send(error.error.error_description);

            });

    })

    .catch((error) => {

        res.status(error.statusCode).send(error.error.error_description);

    });

              }

            else {

    return res.status(400).send("required parameter missing")

}

     });

app.listen(80, () => console.log('App is running on port 80'));