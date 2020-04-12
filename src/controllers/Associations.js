const models = require('../../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

export async function deleteRepeatedAssociations(
  itemKey,
  assocTable,
  movieID,
  people
) {
  let attributes = ['id', itemKey, 'movie_id']
  if (people) {
    if (people === 'characters') {
      attributes.push('main')
      attributes.push('character_name')
      attributes.push('type')
    }
  } else {
    attributes.push('primary')
  }
  const list = await models[assocTable].findAll({
    where: { movie_id: movieID },
    attributes,
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

export async function updateCharacters(movie, list) {
  await deleteRepeatedAssociations(
    'person_id',
    'movies_characters',
    movie.id,
    'characters'
  )

  updateAssociations(
    movie,
    list,
    'person_id',
    'movies_characters',
    'characters'
  )
  updatePeople(movie, list)
}

async function updatePeople(movie, list) {
  const currentAssoc = await models['movies_characters'].findAll({
    where: { movie_id: movie.id },
    attributes: ['id', 'person_id', 'movie_id'],
    raw: true,
  })
  const currentPeople = await models.person.findAll({
    where: {
      id: {
        [Op.in]: currentAssoc.map((ca) => ca.person_id),
      },
    },
    attributes: ['id', 'name', 'gender', 'date_of_birth'],
  })

  currentPeople.forEach((currentPersonRecord) => {
    const currentPerson = currentPersonRecord.dataValues

    const updatedPerson = list.find((item) => {
      return parseInt(item.id) === parseInt(currentPerson.id);
    })

    if (updatedPerson) {
      let isUpdated = false

      if (currentPerson.gender != updatedPerson.gender) {
        currentPersonRecord.gender = updatedPerson.gender
        isUpdated = true
      }

      if (currentPerson.date_of_birth != updatedPerson.date_of_birth) {
        currentPersonRecord.date_of_birth = updatedPerson.date_of_birth
        isUpdated = true
      }
      if (isUpdated) {
        return currentPersonRecord.save()
      }
    }
  })
}

async function updateAssociations(movie, list, itemKey, assocTable, people) {
  let attributes = ['id', itemKey, 'movie_id']
  if (people) {
    if (people === 'characters') {
      attributes.push('main')
      attributes.push('character_name')
      attributes.push('type')
    }
  } else {
    attributes.push('primary')
  }

  const current = await models[assocTable].findAll({
    where: { movie_id: movie.id },
    attributes,
    raw: true,
  })

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
      if (people) {
        if (people === 'characters') {
          const notEqual =
            updated[assocTable].main !== assoc.main ||
            updated[assocTable].character_name !== assoc.character_name ||
            updated[assocTable].type !== assoc.type

          if (notEqual) {
            //check if it has been already added
            const alreadyAdded =
              toUpdate.findIndex((tu) => tu[itemKey] === assoc[itemKey]) != -1
            if (!alreadyAdded) {
              toUpdate.push({
                id: assoc.id,
                key: assoc[itemKey],
                main: updated[assocTable].main,
                character_name: updated[assocTable].character_name,
                type: updated[assocTable].type,
              })
            }
          }
        }
      } else {
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
    let toInsert = {
      movie_id: movie.id,
    }
    if (people) {
      if (people === 'characters') {
        toInsert.main = ta[assocTable].main
        toInsert.character_name = ta[assocTable].character_name
        toInsert.type = ta[assocTable].type
      }
    } else {
      toInsert.primary = ta[assocTable].primary
    }

    toInsert[itemKey] = ta.id

    await models[assocTable].upsert(toInsert)
  })

  //update primary field
  toUpdate.forEach(async (change) => {
    let updateObj = {}
    if (people) {
      if (people === 'characters') {
        updateObj.main = change.main
        updateObj.type = change.type
        updateObj.character_name = change.character_name
      }
    } else {
      updateObj.primary = change.primary
    }
    await models[assocTable].update(updateObj, { where: { id: change.id } })
  })

  return {
    toAdd,
    toDelete,
    toUpdate,
  }
}
