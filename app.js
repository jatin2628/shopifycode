const express = require('express');
const Shopify = require('shopify-api-node');
const ejs = require('ejs');
const crypto = require('crypto');

//onetimerevealtoken = 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

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

const shopify = new Shopify({
    shopName: 'jtstore2.myshopify.com',
    apiKey: '91261aa980d010667e48567cb41151d6',
    password: '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'
  });
  
app.set('view engine','ejs');


app.get('/custom-order', (req, res) => {
    shopify.order
  .list({ limit: 5 })
  .then((orders) => res.send(orders))
  .catch((err) => console.error(err));

  });

  app.get('/custom-product', (req, res) => {
    // Fetch some data from Shopify API
    shopify.product.list({ limit: 5 })
      .then(products => {
        // Render the EJS template with the fetched data
        res.send(products);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send('Error fetching data');
      });
  });


  // app.get('/auth', async (req, res) => {
  //   const { code, shop, state } = req.query;
  
  //   const isValidState = state === req.session.state;
  //   delete req.session.state;
  
  //   if (!isValidState) {
  //     return res.status(403).send('Forbidden');
  //   }
  
  //   try {
  //     const { access_token } = await shopify.oauth.accessToken(code, shop);
  
  //     // Store the access token securely
  //     // ...
  
  //     res.send('App installed successfully!');
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Something went wrong');
  //   }
  // });
 

  // app.post('/create-app', async (req, res) => {
  //   const { appName, shopName } = req.body;
  //   const state = crypto.randomBytes(8).toString('hex');
  
  //   const installUrl = shopify.oauth.createGrantUrl({
  //     shop: shopName,
  //     scopes: process.env.SCOPES.split(','),
  //     redirectUri: `${process.env.BASE_URL}/auth`,
  //     state,
  //   });
  
  //   res.redirect(installUrl);
  // });





//   app.post('/create-app', (req, res) => {
//     const storeUrl = req.body.store;
    

//     if (!storeUrl) {
//       res.status(400).send('Store URL is required');
//       return;
//     }

   
  
//     // Create the app in the specified store
//     const app = {
//       name: 'jatinapp',
//       apiKey: '6a6c9f4d0c257bc89e2b21064f846170',
//       apiSecret: 'caad249c1692e73947967a070b3a8ef0',
//       redirectUri: 'https://jtstore2.myshopify.com/apps/crt',
//       scopes: ['read_products', 'write_products']
//     };
//     shopify.application.create(app, storeUrl)
//       .then(result => {
//         console.log(result);
//         res.send('App created successfully!');
//       })
//       .catch(err => {
//         console.log(err);
//         res.status(500).send('Error creating app');
//       });
//   });

//  app.get('/', (req, res) => {
//     const shop = req.query.shop;
//     const state = crypto.randomBytes(8).toString('hex');
  
//     const installUrl = shopify.oauth.createGrantUrl({
//       shop,
//       scopes: process.env.SCOPES.split(','),
//       redirectUri: `${process.env.BASE_URL}/auth`,
//       state,
//     });
  
//     res.redirect(installUrl);
//   });

// app.use('/',(req,res)=>{
//     res.render('index');
// })

app.get('/',(req,res)=>{
  res.render('index');s
})

app.post('/create-app',(req,res)=>{
  shopify.appl
})

app.listen(4000,()=>{
    console.log("app is listen at 4000");
})