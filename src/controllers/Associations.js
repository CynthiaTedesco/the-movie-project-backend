const models = require("../../models");
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

async function deleteOrphans(req, res) {
  await deleteOrphansFrom("movies_genres");
  await deleteOrphansFrom("movies_languages");
  await deleteOrphansFrom("movies_restrictions");
  await deleteOrphansFrom("movies_producers");
  await deleteOrphansFrom("movies_writers");
  await deleteOrphansFrom("movies_characters");
  await deleteOrphansFrom("movies_directors");

  return res.status(200).send({ message: "Successfully deleted all orphans" });
}

async function deleteOrphansFrom(assocTable) {
  const query = `select mp.id from ${assocTable} mp left join movies m on m.id = mp.movie_id where m.id is null;`;
  const orphans = await models.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
  return models[assocTable].destroy({
    where: {
      id: {
        [Op.in]: orphans.map((a) => a.id),
      },
    },
  });
}

async function deleteRepeatedAssociations(
  itemKey,
  assocTable,
  movieID,
  people
) {
  let attributes = ["id", itemKey, "movie_id"];
  if (people) {
    if (people === "characters") {
      attributes.push("main");
      attributes.push("character_name");
      attributes.push("type");
    }
  } else {
    attributes.push("primary");
  }
  const list = await models[assocTable].findAll({
    where: { movie_id: movieID },
    attributes,
    raw: true,
  });

  //delete repeated
  let repeated = [];
  let items = [];

  list
    .sort((a, b) => a.id - b.id)
    .forEach((cg) => {
      if (items.indexOf(cg[itemKey]) === -1) {
        items.push(cg[itemKey]);
      } else {
        repeated.push(cg.id);
      }
    });

  return models[assocTable]
    .destroy({
      where: {
        id: {
          [Op.in]: repeated,
        },
      },
    })
    .catch((err) => {
      console.log(err);
      const message = `Error while trying to delete repeated ${assocTable}`;
      return res.status(500).send({ message });
    });
}

async function updateGenres(movie, list) {
  await deleteRepeatedAssociations("genre_id", "movies_genres", movie.id);
  updateAssociations(movie, list, "genre_id", "movies_genres");
}
async function updateProducers(movie, list) {
  await deleteRepeatedAssociations("producer_id", "movies_producers", movie.id);
  updateAssociations(movie, list, "producer_id", "movies_producers");

  updateProducer(movie, list);
}
async function updateWriters(movie, list) {
  await deleteRepeatedAssociations(
    "person_id",
    "movies_writers",
    movie.id,
    "writers"
  );

  updateAssociations(movie, list, "person_id", "movies_writers", "writers");
  updatePeople(movie, list);
}
async function updateDirectors(movie, list) {
  await deleteRepeatedAssociations(
    "person_id",
    "movies_directors",
    movie.id,
    "directors"
  );

  updateAssociations(movie, list, "person_id", "movies_directors", "directors");
  updatePeople(movie, list);
}
async function updateRestrictions(movie, list) {
  await deleteRepeatedAssociations(
    "restriction_id",
    "movies_restrictions",
    movie.id
  );

  updateAssociations(movie, list, "restriction_id", "movies_restrictions");
}

async function updateCharacters(movie, list) {
  await deleteRepeatedAssociations(
    "person_id",
    "movies_characters",
    movie.id,
    "characters"
  );

  updateAssociations(
    movie,
    list,
    "person_id",
    "movies_characters",
    "characters"
  );
  updatePeople(movie, list);
}
async function updateProducer(movie, list) {
  const currentAssoc = await models["movies_producers"].findAll({
    where: { movie_id: movie.id },
    attributes: ["id", "producer_id", "movie_id"],
    raw: true,
  });

  const currentProducers = await models.producer.findAll({
    where: {
      id: {
        [Op.in]: currentAssoc.map((ca) => ca.producer_id),
      },
    },
    attributes: ["id", "name", "country"],
  });

  currentProducers.forEach((currentProducerRecord) => {
    const currentProducer = currentProducerRecord.dataValues;

    const updatedProducer = list.find((item) => {
      return parseInt(item.id) === parseInt(currentProducer.id);
    });

    if (updatedProducer) {
      let isUpdated = false;

      if (currentProducer.name != updatedProducer.name) {
        currentProducerRecord.name = updatedProducer.name;
        isUpdated = true;
      }

      if (currentProducer.country != updatedProducer.country) {
        currentProducerRecord.country = updatedProducer.country;
        isUpdated = true;
      }
      if (isUpdated) {
        return currentProducerRecord.save();
      }
    }
  });
}

async function updatePeople(movie, list) {
  const currentAssoc = await models["movies_characters"].findAll({
    where: { movie_id: movie.id },
    attributes: ["id", "person_id", "movie_id"],
    raw: true,
  });
  const currentPeople = await models.person.findAll({
    where: {
      id: {
        [Op.in]: currentAssoc.map((ca) => ca.person_id),
      },
    },
    attributes: ["id", "name", "gender", "date_of_birth"],
  });

  currentPeople.forEach((currentPersonRecord) => {
    const currentPerson = currentPersonRecord.dataValues;

    const updatedPerson = list.find((item) => {
      return parseInt(item.id) === parseInt(currentPerson.id);
    });

    if (updatedPerson) {
      let isUpdated = false;

      if (currentPerson.gender != updatedPerson.gender) {
        currentPersonRecord.gender = updatedPerson.gender;
        isUpdated = true;
      }

      if (currentPerson.date_of_birth != updatedPerson.date_of_birth) {
        currentPersonRecord.date_of_birth = updatedPerson.date_of_birth;
        isUpdated = true;
      }
      if (isUpdated) {
        return currentPersonRecord.save();
      }
    }
  });
}

async function getObjectList(list = [], itemKey, assocTable, people) {
  const modelName = itemKey.split("_")[0];
  if (list[0] && list[0].id) {
    return list;
  } else {
    return await Promise.all(
      list
        .map(async (l) => {
          if (l.name) {
            const name =
              people === "writers" ? l.name.split("(")[0].trim() : l.name;
            let dbObj = await models[modelName].findOne({
              where: { name: name },
            });
            if (!dbObj) {
              //we need to create it before continue
              await models[modelName].upsert({ name: name });
              dbObj = await models[modelName].findOne({
                where: { name: name },
              });
            }

            let where = {};
            where[itemKey] = dbObj.id;
            const relation = await models[assocTable].findOne({ where: where });

            let toReturn = dbObj.dataValues;
            toReturn[assocTable] = relation || {};

            return toReturn;
          } else {
            return null;
          }
        })
        .map((a) => a)
    );
  }
}
async function updateAssociations(movie, list, itemKey, assocTable, people) {
  list = await getObjectList(list, itemKey, assocTable, people);
  let attributes = ["id", itemKey, "movie_id"];
  if (people) {
    if (people === "characters") {
      attributes.push("main");
      attributes.push("character_name");
      attributes.push("type");
    } else {
      attributes.push("primary");
      if (people === "writers") {
        attributes.push("detail");
      }
    }
  } else {
    attributes.push("primary");
  }

  const current = await models[assocTable].findAll({
    where: { movie_id: movie.id },
    attributes,
    raw: true,
  });

  const toAdd = list.filter(
    (l) => current.findIndex((c) => c[itemKey] == l.id) === -1
  ).filter(a=>a);
  console.log("--- toAdd", toAdd);

  const toDelete = current
    .map((assoc) => {
      const updated = list.find((item) => item.id == assoc[itemKey]);
      if (!updated) {
        return {
          id: assoc.id,
          key: assoc[itemKey],
        };
      }
    })
    .filter((a) => a);
  console.log("--- toDelete", toDelete);

  const toUpdate = [];
  current.map((assoc, index, array) => {
    const updated = list.find((item) => item.id == assoc[itemKey]);
    if (updated) {
      if (people === "characters") {
        const notEqual =
          updated[assocTable].main !== assoc.main ||
          updated[assocTable].character_name !== assoc.character_name ||
          updated[assocTable].type !== assoc.type;

        if (notEqual) {
          //check if it has been already added
          const alreadyAdded =
            toUpdate.findIndex((tu) => tu[itemKey] === assoc[itemKey]) != -1;
          if (!alreadyAdded) {
            toUpdate.push({
              id: assoc.id,
              key: assoc[itemKey],
              main: updated[assocTable].main,
              character_name: updated[assocTable].character_name,
              type: updated[assocTable].type,
            });
          }
        }
      } else {
        if (updated[assocTable].primary !== assoc.primary || array.length === 1) {
          //check if it has been already added to the upcoming updates list
          const alreadyAdded =
            toUpdate.findIndex((tu) => tu[itemKey] === assoc[itemKey]) != -1;
          if (!alreadyAdded) {
            toUpdate.push({
              id: assoc.id,
              key: assoc[itemKey],
              primary: updated[assocTable].primary || array.length === 1, //if there is only one element we assume it is the primary
            });
          }
        }
      }
    }
  });
  console.log("--- toUpdate", toUpdate);

  //delete
  await models[assocTable].destroy({
    where: {
      id: {
        [Op.in]: toDelete.map((td) => td.id),
      },
    },
  });

  //add new associations
  toAdd.forEach(async (ta) => {
    let toInsert = {
      movie_id: movie.id,
    };
    if (people) {
      if (people === "characters") {
        toInsert.main = ta[assocTable].main;
        toInsert.character_name = ta[assocTable].character_name;
        toInsert.type = ta[assocTable].type;
      }
    } else {
      toInsert.primary = ta[assocTable].primary;
    }

    toInsert[itemKey] = ta.id;

    await models[assocTable].upsert(toInsert);
  });

  //update primary field
  toUpdate.forEach(async (change) => {
    let updateObj = {};
    if (people === "characters") {
      updateObj.main = change.main;
      updateObj.type = change.type;
      updateObj.character_name = change.character_name;
    } else {
      updateObj.primary = change.primary;
    }
    await models[assocTable].update(updateObj, { where: { id: change.id } });
  });

  return {
    toAdd,
    toDelete,
    toUpdate,
  };
}

module.exports = {
  updateGenres,
  updateCharacters,
  updateDirectors,
  updateRestrictions,
  updateWriters,
  updateProducers,
  deleteRepeatedAssociations,
  deleteOrphans,
};
