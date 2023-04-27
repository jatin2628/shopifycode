const express = require('express');
const session = require('express-session');
const ShopifyToken = require('shopify-token');
const ShopifyAPIClient = require('shopify-api-node');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const models = require('./models');
const Product = models.Product;

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.originalname}-${Date.now()}.jpg`);
  },
});

const upload = multer({
  storage:multerStorage
});



const SHOPIFY_APP_KEY = 'acd7680f2821c0d3d779da01bd6c2c25';
const SHOPIFY_APP_SECRET = 'ec528900d55fb2fff4ad068d93aef80f';

const app = express();
const cors = require('cors');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname,"../","public")));
app.use(cors());
app.use(express.static(path.join(__dirname,"../","images")));
const imageData = fs.readFileSync('images/shirt.jpg', { encoding: 'base64' });
const template = {
  "T1":{
    "Size":["XS","S","M","L","XL","XLL"],
    "Color":["Red","Green","Pink","Yellow"],
    "Type":["Pattern","Check","Plain"],
    "Material":"Cotton"
  },
  "T2":{
    "Size":["XS","S","M","L","XL","XLL"],
    "Color":["Red","Green","Pink","Yellow"],
    "Pattern":["XYZ"]
  }
}
const shopify = new ShopifyAPIClient({
  shopName: 'jtstore2.myshopify.com',
  apiKey: '91261aa980d010667e48567cb41151d6',
  password: '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'
});

const shopifyToken = new ShopifyToken({
  sharedSecret: SHOPIFY_APP_SECRET,
  apiKey: SHOPIFY_APP_KEY,
  redirectUri: 'http://localhost:80/callback',
  scopes: ['read_products', 'write_products']
});

app.get('/custom-product', async (req, res) => {
  try {
    const products = await shopify.product.list()
    console.log(products[1].variants[0].product_id);
    res.send(products);

  }
  catch (err) {


  }
});

app.get('/product/:id', async (req, res) => {
  try {
    const product = await shopify.product.get(req.params.id);
    const productUrl = `https://jtstore2.myshopify.com/products/${product.handle}`;
    res.redirect(productUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
  }
});

app.get('/varopt', (req, res) => {
 
  const newProduct = {
    title: 'New Product 2S',
    body_html: 'This is a new product',
    vendor: 'Your vendor',
    product_type: 'Your product type',
    variants: [
      {
        option1: 'Black',
        option2: 'Yamaha',
        option3: 'A',
        option4: 'A1',
        option5: 'A2',
        price: '200000',
        sku: 'SKU0011',
    
      },
      {
        option1: 'Black',
        option2: 'Yamaha',
        option3: 'B',
        option4: 'B1',
        option5: 'B2',                                                 
        price: '200000',
        sku: 'SKU0012',
        
      },
      {
        option1: 'Grey',
        option2: 'Yamaha',
        option3: 'C',
        option4: 'C1',
        option5: 'C2',
        price: '200000',
        sku: 'SKU0013',
        
      },
    ],
    options: [
      {
        name: 'Color',
        values: ['Black', 'Silver', 'Grey'],
      },
      {
        name: 'Company',
        values: ['Yamaha'],
      },
      {
        name: 'Jatin',
        values: ['A', 'B', 'C'],
      },
      {
        name: 'Jatin1',
        values: ['A1', 'B1', 'C1'],
      },
      {
        name: 'Jatin2',
        values: ['A2', 'B2', 'C2'],
      },
    ]
  };
  
  shopify.product.create(newProduct)
    .then((product) => console.log(product))
    .catch((error) => console.log(error.response.body.errors))
    

    
})

app.get('/', (req, res) => {
  res.render('try');
});

app.post('/install', (req, res) => {
  const { shop } = req.body;
  const authUrl = shopifyToken.generateAuthUrl(shop, undefined, undefined, undefined, true);
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { shop, code } = req.query;

  const accessToken = await shopifyToken.getAccessToken(shop, code);
  const shopifyClient = new ShopifyAPIClient({
    shopName: shop,
    accessToken: accessToken
  });
  res.redirect(`https://${shop}/admin`);
});

app.get("/app2", async (req, res) => {
  try {
    const products = await shopify.product.list()

    res.render("welcomeapp", { products: products });

  } catch (error) {
    res.status(500).send('Error fetching data');
  }

})

app.get("/app", (req, res) => {
  // res.render('index',{'url' : '/app2'})
  res.send(`<script>window.open("/app2",'_blank')</script>`)
})


app.get('/product', async (req, res) => {
  const { shop } = req.query;

  const accessToken = req.session.accessToken;
  if (!accessToken) {
    res.redirect(`/install?shop=${shop}`);
    return;
  }

  const shopifyClient = new ShopifyAPIClient({
    shopName: shop,
    accessToken: accessToken,
  });

  try {
    const products = await shopifyClient.product.list();
    res.send(products);
    // res.render('products', { products });
  } catch (error) {
    console.log(error);
    res.send('Error fetching products');
  }
});


app.get("/vo",(req,res)=>{

  const productData = {
    title: 'Shirts',
    body_html: '<strong>It is a shirt</strong>',
    vendor: 'jtstore2',
    product_type: 'Fashion',
    options: Object.keys(template.T1).map(option => ({
      name: option,
      values: template.T1[option]
    })),
    images: [
      {
        src: 'https://m.media-amazon.com/images/I/71lGQ8NsEGL._UY741_.jpg',
      },
      {
        src: 'https://m.media-amazon.com/images/I/71STlAUmZnL._UY741_.jpg',
      },
      {
        src: 'https://imagescdn.peterengland.com/img/app/product/8/804788-9532160.jpg?q=75&auto=format&w=342',
      },
      {
        src: 'https://imagescdn.vanheusenindia.com/img/app/product/7/700766-7532503.jpg?q=75&auto=format&w=342',
      },
      {
        src: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.meesho.com%2Fred-check-shirt-for-men%2Fp%2F2q6lce&psig=AOvVaw0QST9MRjqayNTcLE_KhE64&ust=1682500586986000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPiK55_ZxP4CFQAAAAAdAAAAABAE',
      },
      {
        src: 'https://rukminim1.flixcart.com/image/832/832/jvmpci80/shirt/h/x/b/m-32907-0041-levi-s-original-imafghwaefycgbtf.jpeg?q=70',
      },
      {
        src: 'https://assets.ajio.com/medias/sys_master/root/20221109/Vn85/636b8f92aeb269659c7fa375/-473Wx593H-462449490-green-MODEL.jpg',
      },
      {
        src: 'https://rukminim1.flixcart.com/image/832/832/l3rmzrk0/shirt/3/k/s/s-maroon-red-stoneberg-original-imagetgbxaerztqp.jpeg?q=70',
      },
      {
        src: 'https://rukminim1.flixcart.com/image/832/832/kxc5nrk0/shirt/t/6/2/m-sher-print-yel-base-41-original-imag9t6uxgppsmrf.jpeg?q=70',
      },
    ],
    variants:[
      {
      option1: 'X',
      option2: 'Red',
      option3: 'Pattern',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Red',
      option3: 'Pattern',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Red',
      option3: 'Pattern',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Green',
      option3: 'Pattern',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Green',
      option3: 'Pattern',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Green',
      option3: 'Pattern',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Yellow',
      option3: 'Pattern',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Yellow',
      option3: 'Pattern',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Yellow',
      option3: 'Pattern',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Red',
      option3: 'Check',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Red',
      option3: 'Check',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Red',
      option3: 'Check',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Green',
      option3: 'Check',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Green',
      option3: 'Check',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Green',
      option3: 'Check',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Yellow',
      option3: 'Check',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Yellow',
      option3: 'Check',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Yellow',
      option3: 'Check',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Red',
      option3: 'Plain',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Red',
      option3: 'Plain',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Red',
      option3: 'Plain',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Green',
      option3: 'Plain',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Green',
      option3: 'Plain',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Green',
      option3: 'Plain',
      price: '649',
      sku: 'SKU001',
    },
    {
      option1: 'X',
      option2: 'Yellow',
      option3: 'Plain',
      price: '599',
      sku: 'SKU001',
    },
      {
      option1: 'XL',
      option2: 'Yellow',
      option3: 'Plain',
      price: '799',
      sku: 'SKU001',
    },
      {
      option1: 'M',
      option2: 'Yellow',
      option3: 'Plain',
      price: '649',
      sku: 'SKU001',
    },

  ],
  };
 
   
  shopify.product.create(productData).then((product) => {
    console.log(product);
  }).catch((err) => {
    console.log(err.response.body.errors);
  });
  
})





const bkt = {
  "Bike":{
    // "Color":["Red","Black","White"],
    "Speed":["80km/h","100km/h"],
    "Material":["Metal"],
    "Mileage":["45","50","60"]
  },
  "Car":{
    "Color":["Red","Black","White"],
    "Speed":["120km/h","150km/h"],
    "Material":["Metal"],
    "Model":["Old","Latest"]
  }
} 

app.get("/uvo",async (req,res)=>{

  const BikeVariants = [
    {
      // option1: 'Red',
      option2: '80km/h',
      option3: 'Metal',
      option4: '45',
      price: '10000.00',
      sku: 'SM-RED-COT-CA-NK-SU',
    },
    {
      // option1: 'Red',
      option2: '100km/h',
      option3: 'Metal',
      option4: '60',
      price: '15000.00',  
      sku: 'SM-RED-COT-CA-NK-S5U',
    },
    // ...
  ];

  try {
    
      newOptions = bkt.Bike;
      up = await shopify.product.update(8255091867924, {
        options: newOptions,
        variants: BikeVariants,
      })

  console.log("Updated successfully",up);
  res.send("updated")
  } catch (error) {
    console.log(error.response.body.errors);
    res.send(error)
  }
})

app.get("/lt",async (req,res)=>{
  try {
    const product = await shopify.product.get("8255116050708");
      product.options.push({
        name: 'Jatin',
        values: ['a', 'b', 'c']
      });

// Update the product data in your store with the modified options
await shopify.product.update("8255116050708", product);
console.log("add done")
    
  } catch (error) {
    console.log(error.response.body.errors);
  }
})


app.get('/product-options/:productId', (req, res) => {
  const productId = req.params.productId;
  const productOptions = [
    {
      "name":"Size",
      "values":["XS","S","M","L","XL","XLL"]
    },
    {
      "name":"Color",
      "values":["Red","Green","Pink","Yellow"]
    },
    {
      "name":"Type",
      "values":["Pattern","Check","Plain"]
    },
    {
      "name":"Material",
      "values":["Cotton"]
    },
  ]
  res.json(productOptions);
});



app.post("/addproduct",upload.single('imageurl'),async (req,res)=>{
  try {
    const {title,description,price,Size,Material,Color,Type} = req.body;

    const product = await Product.create({
      title:title,
      description:description,
      price:price,
      Size:Size,
      Material:Material,
      Color:Color,
      Type:Type,
      imageurl:req.file.filename
    })

    res.json({"MSG":"Product created successfully","data":product});
    
  } catch (error) {
    console.log(error);
  }
})

app.listen(80, () => {
  console.log('Server started on port 80');
});

