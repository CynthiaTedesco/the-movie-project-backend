const toBeMerged_plain = [
  'title',
  'original_title',
  'release_date',
  'budget',
  { db: 'website', json: 'website', api: 'homepage' },
  'revenue',
  { db: 'length', json: 'length', api: 'runtime' },
  'status',
  'overview',
  { db: 'plot_line', json: 'plot_line', api: 'tagline' },
  'imdb_rating',
  'box_office',
  'subsFileName',
  'word_count',
  'most_used_word',
  'tmdb_id',
  'awards',
]
const toBeMerged_object = [
  //   'set_in_time',
  //   { attr: 'type', inner: 'name' },
  //   set_in_place,
  { attr: 'poster', inner: 'url' },
  { attr: 'story_origin', inner: 'name' },
]
const toBeMerged_list = [
  'genres',
  'languages',
  { db: 'characters', json: 'actors', api: 'actors' },
  'restrictions',
  'directors',
  // 'producers',
  // 'writers',
  // 'production_companies',
  // 'production_countries',
  // 'original_language',
  // 'spoken_languages',
]
/**
 *
 * @param {*} origin could be 'db', 'api'
 * Updates old with merged
 * Returns updated fields (with db nomenclatures),
 */
function getMergedMovie(old, newm, origin, target = 'db', updates = {}) {
  let updatedFields = {}
  const updatesKeys = Object.keys(updates)

  toBeMerged_plain.forEach((attr) => {
    let old_attr_name
    let new_attr_name
    let oldValue
    let newValue

    if (typeof attr === 'object') {
      old_attr_name = attr[origin]
      new_attr_name = attr[target]
      oldValue = old[old_attr_name]
      newValue = newm[new_attr_name]
    } else {
      old_attr_name = attr
      new_attr_name = attr
      oldValue = old[old_attr_name]
      newValue = newm[new_attr_name]
    }

    //we need to check that the attr exist in both objects before comparing,
    //(even if it is undefined the key should exist),
    //this way we avoid to modify wrong attributes
    if (new_attr_name in newm && old_attr_name in old) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        let areDifferent = true

        //check if they are numbers
        if (!isNaN(oldValue) && !isNaN(newValue)) {
          areDifferent = parseFloat(oldValue) !== parseFloat(newValue)
        }

        if (areDifferent) {
          updatedFields[old_attr_name] = newValue
          old[old_attr_name] = newValue
          if (origin === 'json') {
            old.updated = new Date()
          }
        }
      }
    }
  })

  toBeMerged_object.forEach((tbm) => {
    const { attr, inner } = tbm
    //we need to check that the attr exist in both objects before comparing,
    //(even if it is undefined the key should exist),
    //this way we avoid to modify wrong attributes
    if (attr in newm && attr in old) {
      if (origin === 'db') {
        if (old.dataValues && old.dataValues[`${attr}_id`]) {
          const oldValue = old.dataValues[attr]
            ? old.dataValues[attr].dataValues
            : null
          if (updates[attr]) {
            if (oldValue) {
              if (oldValue[inner] !== updates[attr][inner]) {
                updatedFields[attr] = updates[attr]
              }
            } else if (updates[attr][inner]) {
              updatedFields[attr] = updates[attr]
            }
          } else {
            // if (!old.dataValues[attr]) {
            //   const alternativeAttr = `${attr}_id`
            //   console.log(
            //     'ALGO UNDEFINED',
            //     attr,
            //     old.dataValues,
            //     alternativeAttr
            //   )
            //   if (old.dataValues[alternativeAttr] && newm[attr]) {
            //     if (old.dataValues[alternativeAttr] !== newm[attr].id) {
            //       console.log('HA CAMBIADO')
            //     }
            //   }
            // } else {
            if (old.dataValues[attr].dataValues[inner] !== newm[attr]) {
              updatedFields[attr] = {}
              updatedFields[attr]['id'] = old.dataValues[attr].dataValues['id']
              updatedFields[attr][inner] = newm[attr]
            }
            // }
          }
        } else {
          console.log(`${attr}_id is null`)
        }
      } else {
        const attrHasBeenUpdated = updatesKeys.indexOf(attr) > -1
        if (attrHasBeenUpdated) {
          if (updates[attr]) {
            if (!old[attr]) {
              old[attr] = {}
            }
            if (updates[attr].id) {
              old[attr]['id'] = updates[attr].id
            }
            if (typeof old[attr] === 'string') {
              old[attr][inner] = updates[attr][inner]
              updatedFields[attr] = updates[attr]
            } else if (old[attr][inner] !== updates[attr][inner]) {
              old[attr][inner] = updates[attr][inner]
              updatedFields[attr] = updates[attr]
            }
          } else {
            if (old[attr]) {
              old[attr] = null
            }
          }
        }
      }
    }
  })

  toBeMerged_list.forEach((attr) => {
    let old_attr_name
    let new_attr_name
    let oldValue
    let newValue

    if (typeof attr === 'object') {
      old_attr_name = attr[origin]
      new_attr_name = attr[target]
      oldValue = old[old_attr_name]
      newValue = newm[new_attr_name]
    } else {
      old_attr_name = attr
      new_attr_name = attr
      oldValue = old[old_attr_name]
      newValue = newm[new_attr_name]
    }

    if (origin === 'db') {
      if (new_attr_name in newm && old_attr_name in old.dataValues) {
        const dbAttrList = old.dataValues[old_attr_name]
        if (target === 'api') {
          // api collection will be e.g directors: ['James Cameron']

          let toMap
          if (
            newm[new_attr_name].length &&
            typeof newm[new_attr_name][0] === 'object'
          ) {
            toMap = newm[new_attr_name].map((a) => a.name)
          } else {
            toMap = newm[new_attr_name]
          }

          toMap.map((u) => {
            const isPresent = dbAttrList.find((a) => {
              //TODO split u into name and details when processing writers
              if (a.dataValues && a.dataValues.name === u) {
                return true
              }
              return false
            })
            if (!isPresent) {
              if (!updatedFields[old_attr_name]) {
                updatedFields[old_attr_name] = []
              }
              updatedFields[old_attr_name].push({
                name: u,
              })
            }
          })
        }
      }
    }
  })
  return updatedFields
}

function getNumber(string) {
  return parseFloat(string.replace('$', '').replace(/,/g, ''))
}
module.exports = {
  getMergedMovie,
  getNumber,
}
