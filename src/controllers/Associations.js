const models = require('../../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

export async function deleteRepeatedAssociations(itemKey, assocTable, movieID) {
  const list = await models[assocTable].findAll({
    where: { movie_id: movieID },
    attributes: ['id', 'genre_id', 'movie_id', 'primary'],
    raw: true,
  })

  //delete repeated
  let repeated = []
  let items = []

  list
    .sort((a, b) => a.id - b.id)
    .forEach((cg) => {
      if (items.indexOf(cg[itemKey]) === -1) {
        items.push(cg[itemKey])
      } else {
        repeated.push(cg.id)
      }
    })

  return models[assocTable].destroy({
    where: {
      id: {
        [Op.in]: repeated,
      },
    },
  })
}

export async function updateGenres(movie, list) {
  await deleteRepeatedAssociations('genre_id', 'movies_genres', movie.id)
  updateAssociations(movie, list, 'genre_id', 'movies_genres')
}

async function updateAssociations(movie, list, itemKey, assocTable) {
  const current = await models[assocTable].findAll({
    where: { movie_id: movie.id },
    attributes: ['id', itemKey, 'movie_id', 'primary'],
    raw: true,
  })

  //check if there is any new field
  //   const toCreate = list
  //     .filter((item) => !item.id)
  //     .map((item2) => {
  //       return {
  //         name: item2.name,
  //         primary: item2[assocTable].primary,
  //       }
  //     })

  const toAdd = list.filter(
    (l) => current.findIndex((c) => c[itemKey] == l.id) === -1
  )

  const toDelete = current
    .map((assoc) => {
      const updated = list.find((item) => item.id == assoc[itemKey])
      if (!updated) {
        return {
          id: assoc.id,
          key: assoc[itemKey],
        }
      }
    })
    .filter((a) => a)

  const toUpdate = []
  current.map((assoc) => {
    const updated = list.find((item) => item.id == assoc[itemKey])
    if (updated) {
      if (updated[assocTable].primary !== assoc.primary) {
        //check if it has been already added
        const alreadyAdded =
          toUpdate.findIndex((tu) => tu[itemKey] === assoc[itemKey]) != -1
        if (!alreadyAdded) {
          toUpdate.push({
            id: assoc.id,
            key: assoc[itemKey],
            primary: updated[assocTable].primary,
          })
        }
      }
    }
  })

  //delete
  await models[assocTable].destroy({
    where: {
      id: {
        [Op.in]: toDelete.map((td) => td.id),
      },
    },
  })

  //add new associations
  toAdd.forEach(async (ta) => {
    const toInsert = {
      movie_id: movie.id,
      primary: ta[assocTable].primary,
    }
    toInsert[itemKey] = ta.id

    await models[assocTable].upsert(toInsert)
  })

  //update primary field
  toUpdate.forEach(async (change) => {
    await models[assocTable].update(
      { primary: change.primary },
      { where: { id: change.id } }
    )
  })

  return {
    toAdd,
    toDelete,
    toUpdate,
  }
}
