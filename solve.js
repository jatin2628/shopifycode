const express = require('express');
const app = express();
const { spawn } = require('child_process');

app.set("view engine","ejs");
function opentab() {
  res.send("<script>window.open('/app2');</script>")
}

app.get('/app2', (req, res) => {
  console.log('appppppppppppppppppp2')
  res.send('dhuhcu')
})


app.get('/app', (req, res) => {
  res.render('index',{'url' : '/app2'})

})

app.get('/', (req, res) => {
  res.send('Welcome')
})

app.listen(8000, () => {
  console.log('Server started on port 8000');
});
