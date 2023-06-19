const express = require('express');
const routes = require('./routes/index')
const app = express();
const errorHandler=require('./middelware/errorHandler')
const PORT=process.env.APP_PORT || 3000;

app.use(express.json());
app.use('/api',routes);

app.use(errorHandler);
app.listen(PORT,()=> console.log(`listening on port ${PORT}`));