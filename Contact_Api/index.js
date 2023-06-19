import express from 'express';
const app=express();
const PORT=process.env.APP_PORT || 3000;

app.use(express.json());
app.use('/', (req,res)=>{
    res.send("welcome to node application")
})

app.listen(PORT, ()=> console.log(`Application listening on port ${PORT}`))
