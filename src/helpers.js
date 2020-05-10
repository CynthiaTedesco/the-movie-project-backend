const toBeMerged_plain = [
  'title',
  'original_title',
  'release_date',
  'budget',
  { db: 'website', api: 'homepage' },
  'revenue',
  { db: 'length', api: 'runtime' },
  'status',
  'overview',
  { db: 'plot_line', api: 'tagline' },
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
  { attr: 'poster', inner: 'url' },
  // 'type',
  //   story_origin,
  //   set_in_place,
]
const toBeMerged_list = [
  // 'genres',
  //producers
  //languages//
  //characters
  // 'restrictions',
  // 'directors',
  // 'writers',
  // 'production_companies',
  // 'production_countries',
  // 'original_language',
  // 'spoken_languages',
  // 'actors',
]
/**
 *
 * @param {*} origin could be 'db', 'api'
 * Updates old with merged
 * Returns updated fields (with db nomenclatures),
 */
function getMergedMovie(old, newm, origin, target = 'db', updates = {}) {
  let updatedFields = {}
  toBeMerged_plain.forEach((attr) => {
    let old_attr_name
    let oldValue
    let newValue

    if (typeof attr === 'object') {
      old_attr_name = attr[origin]
      oldValue = old[old_attr_name]
      newValue = newm[attr[target]]
    } else {
      old_attr_name = attr
      oldValue = old[old_attr_name]
      newValue = newm[attr]
    }
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      updatedFields[old_attr_name] = newValue
      old[old_attr_name] = newValue
      if (origin === 'json') {
        old.updated = new Date()
      }
    }
  })

  toBeMerged_object.forEach((tbm) => {
    const { attr, inner } = tbm
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
          if (old.dataValues[attr].dataValues[inner] !== newm[attr]) {
            updatedFields[attr] = {}
            updatedFields[attr]['id'] = old.dataValues[attr].dataValues['id']
            updatedFields[attr][inner] = newm[attr]
          }
        }
      } else {
        console.log('POSTER_ID is null')
      }
    } else {
      console.log('ORIGIN', origin)
      if (updates[attr]) {
        if (!old[attr]) {
          old[attr] = {}
          if (updates[attr].id) {
            old[attr]['id'] = updates[attr].id
          }
        }
        if (typeof old[attr] === 'string') {
          old[attr][inner] = updates[attr][inner]
          updatedFields[attr] = updates[attr]
        } else if (old[attr][inner] !== updates[attr][inner]) {
          old[attr][inner] = updates[attr].url
          updatedFields[attr] = updates[attr]
        }
      }
    }
  })
  toBeMerged_list.forEach((attr) => {})

  return updatedFields
}

function getNumber(string) {
  return parseFloat(string.replace('$', '').replace(/,/g, ''))
}
module.exports = {
  getMergedMovie,
  getNumber,
}
