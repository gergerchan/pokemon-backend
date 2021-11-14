require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const { Pokemon } = require("./models");
const cors = require("cors");

app.use(cors());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  Pokemon.findAll().then((pokemon) => {
    if (pokemon.length > 0) {
      res.status(200).json({
        status: "success",
        message: "Data Available",
        data: pokemon,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "There is No Data",
        data: "No Data",
      });
    }
  });
});

app.get("/count", async (req, res) => {
  try {
    const allDataPokemon = await Pokemon.findAll({ raw: true });
    const mp = new Map(
      allDataPokemon.map((o) => [o.pokemonId, { ...o, count: 0 }])
    );
    for (const { pokemonId } of allDataPokemon) mp.get(pokemonId).count++;
    const result = Array.from(mp.values());
    res.status(201).json({ message: "success", data: result });
  } catch (error) {
    res.status(400).json({
      status: "falied",
      message: error,
      data: "No Data",
    });
  }
});

app.post("/", async (req, res) => {
  try {
    const checkIfNickExist = await Pokemon.findAll({
      where: { nickname: req.body.nickname, pokemonId: `${req.body.pokemonId}` },
      raw: true,
    });
    if(checkIfNickExist.length>0){
      res.status(201).json({ message: `Nickname Exist`});
    }else{
      const pokemonPost = await Pokemon.create({
        nickname: req.body.nickname,
        pokemonId: req.body.pokemonId,
      });
      res.status(201).json({ message: `Success`, data: pokemonPost });
    }
    
  } catch (error) {
    res.status(422).json({ status: "cant create pokemon", message: error });
  }
});

app.put("/:id", (req, res) => {
  Pokemon.update(
    {
      nickname: req.body.nickname,
      pokemonId: req.body.pokemonId,
    },
    { where: { id: req.params.id } }
  )
    .then((pokemon) => {
      res.status(201).json({ message: "success", data: pokemon });
    })
    .catch((err) => {
      res.status(422).json("cant update pokemon");
    });
});

app.delete("/:id", (req, res) => {
  Pokemon.destroy({ where: { id: req.params.id } })
    .then((pokemon) => {
      res.status(201).json({ message: "success", data: pokemon });
    })
    .catch((err) => {
      res.status(422).json("cant delete pokemon");
    });
});

//setup webserver port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
