const toBeMerged = [
  'title',
  'original_title',
  // 'genres',
  'release_date',
  'budget',
  { db: 'website', api: 'homepage' },
  // 'production_companies',
  // 'production_countries',
  'revenue',
  { db: 'length', api: 'runtime' },
  // 'original_language',
  // 'spoken_languages',
  'status',
  'overview',
  { db: 'plot_line', api: 'tagline' },
  // 'restrictions',
  // 'directors',
  // 'writers',
  // 'actors',
  // 'awards',
  // 'poster',
  'imdb_rating',
  // 'type',
  'box_office',
  'subsFileName',
  'word_count',
  'most_used_word',
  'tmdb_id',
]
/**
 *
 * @param {*} origin could be 'db', 'api'
 * Updates old with merged
 * Returns updated fields (with db nomenclatures),
 */
function getMergedMovie(old, newm, origin, target = 'db') {
  let updatedFields = {}
  toBeMerged.forEach((attr) => {
    let old_attr_name
    let new_attr_name
    if (typeof attr === 'object') {
      old_attr_name = attr[origin]
      new_attr_name = attr[target]
    } else {
      old_attr_name = attr
      new_attr_name = attr
    }
    if (
      JSON.stringify(old[old_attr_name]) !== JSON.stringify(newm[new_attr_name])
    ) {
      updatedFields[old_attr_name] = newm[new_attr_name]
      old[old_attr_name] = newm[new_attr_name]
      if (origin === 'json') {
        old.updated = new Date()
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
