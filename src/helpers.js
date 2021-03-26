const toBeMerged_plain = [
  "title",
  "original_title",
  "release_date",
  "budget",
  { db: "website", json: "website", api: "homepage" },
  "revenue",
  { db: "length", json: "length", api: "runtime" },
  "status",
  "overview",
  { db: "plot_line", json: "plot_line", api: "tagline" },
  "imdb_rating",
  // "box_office",
  "subsFileName",
  "word_count",
  "most_used_word",
  "tmdb_id",
  "imdb_id",
  "country",
  // "awards",
];
const toBeMerged_object = [
  //   'set_in_time',
  //   { attr: 'type', inner: 'name' },
  //   set_in_place,
  { attr: "poster", inner: "url" },
  { attr: "story_origin", inner: "name" },
];
const toBeMerged_list = [
  "genres",
  { db: "languages", json: "original_language", api: "original_language" },
  { db: "characters", json: "actors", api: "actors" },
  "restrictions",
  "directors",
  {
    db: "producers",
    json: "production_companies",
    api: "production_companies",
  },
  "writers",
];
/**
 *
 * @param {*} origin could be 'db', 'api'
 * Updates old with merged
 * Returns updated fields (with db nomenclatures),
 */
function getMergedMovie(old, newm, origin, target = "db", updates = {}) {
  let updatedFields = {};
  const updatesKeys = Object.keys(updates);

  toBeMerged_plain.forEach((attr) => {
    let old_attr_name;
    let new_attr_name;
    let oldValue;
    let newValue;

    if (typeof attr === "object") {
      old_attr_name = attr[origin];
      new_attr_name = attr[target];
      oldValue = old[old_attr_name];
      newValue = newm[new_attr_name];
    } else {
      old_attr_name = attr;
      new_attr_name = attr;
      oldValue = old[old_attr_name];
      newValue = newm[new_attr_name];
    }

    //we need to check that the attr exist in both objects before comparing,
    //(even if it is undefined the key should exist),
    //this way we avoid to modify wrong attributes
    if (new_attr_name in newm && old_attr_name in old) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        let areDifferent = true;

        //check if they are numbers
        if (!isNaN(oldValue) && !isNaN(newValue)) {
          areDifferent = parseFloat(oldValue) !== parseFloat(newValue);
        }

        if (areDifferent) {
          updatedFields[old_attr_name] = newValue;
          old[old_attr_name] = newValue;
          if (origin === "json") {
            old.updated = new Date();
          }
        }
      }
    }
  });

  toBeMerged_object.forEach((tbm) => {
    const { attr, inner } = tbm;
    //we need to check that the attr exist in both objects before comparing,
    //(even if it is undefined the key should exist),
    //this way we avoid to modify wrong attributes
    if (attr in newm && attr in old) {
      if (origin === "db") {
        if (old.dataValues && old.dataValues[`${attr}_id`]) {
          const oldValue = old.dataValues[attr]
            ? old.dataValues[attr].dataValues
            : null;
          if (updates[attr]) {
            if (oldValue) {
              if (oldValue[inner] !== updates[attr][inner]) {
                updatedFields[attr] = updates[attr];
              }
            } else if (updates[attr][inner]) {
              updatedFields[attr] = updates[attr];
            }
          } else {
            if (old.dataValues[attr].dataValues[inner] !== newm[attr]) {
              updatedFields[attr] = {};
              updatedFields[attr]["id"] = old.dataValues[attr].dataValues["id"];
              updatedFields[attr][inner] = newm[attr];
            }
          }
        } else {
          console.log(`${attr}_id is null`);
        }
      } else {
        const attrHasBeenUpdated = updatesKeys.indexOf(attr) > -1;
        if (attrHasBeenUpdated) {
          if (updates[attr]) {
            if (!old[attr]) {
              old[attr] = {};
            }
            if (updates[attr].id) {
              old[attr]["id"] = updates[attr].id;
            }
            if (typeof old[attr] === "string") {
              old[attr][inner] = updates[attr][inner];
              updatedFields[attr] = updates[attr];
            } else if (old[attr][inner] !== updates[attr][inner]) {
              old[attr][inner] = updates[attr][inner];
              updatedFields[attr] = updates[attr];
            }
          } else {
            if (old[attr]) {
              old[attr] = null;
            }
          }
        }
      }
    }
  });

  toBeMerged_list.forEach((attr) => {
    let old_attr_name;
    let new_attr_name;
    let oldValue;
    let newValue;

    if (typeof attr === "object") {
      old_attr_name = attr[origin];
      new_attr_name = attr[target];
      oldValue = old[old_attr_name];
      newValue = newm[new_attr_name];
    } else {
      old_attr_name = attr;
      new_attr_name = attr;
      oldValue = old[old_attr_name];
      newValue = newm[new_attr_name];
    }

    if (origin === "db") {
      if (new_attr_name in newm && old_attr_name in old.dataValues) {
        const dbAttrList = old.dataValues[old_attr_name];
        if (target === "api") {
          let toMap;
          switch (old_attr_name) {
            case "genres": {
              toMap = newm[new_attr_name].map((a) => {
                return { name: a.name };
              });
              break;
            }
            case "languages": {
              toMap = [{ name: newm[new_attr_name] }];
              break;
            }
            case "writers": {
              toMap = newm[new_attr_name].map((a) => {
                const parts = a.split(" (");
                const toReturn = {
                  name: parts[0],
                };
                if (parts[1]) {
                  toReturn.detail = parts[1];
                }
                return toReturn;
              });
              break;
            }
            case "producers": {
              toMap = newm[new_attr_name].map((a) => {
                return {
                  name: a.name,
                  country: a.origin_country,
                };
              });
              break;
            }
            default: {
              toMap = newm[new_attr_name].map((a) => {
                return { name: a };
              });
              break;
            }
          }

          const assocTable = `movies_${old_attr_name}`;
          if (old_attr_name === "producers") {
            toMap.map((u) => {
              const isPresent = dbAttrList.find((a) => {
                //TODO split u into name and details when processing writers
                const isCode = () => {
                  //for languages
                  if (a.dataValues.code && u.name) {
                    return (
                      a.dataValues.code.toLowerCase() === u.name.toLowerCase()
                    );
                  } else {
                    return false;
                  }
                };
                if (
                  a.dataValues &&
                  (a.dataValues.name === u.name || isCode())
                ) {
                  return true;
                }
                return false;
              });
              if (isPresent) {
                if (!updatedFields[old_attr_name]) {
                  updatedFields[old_attr_name] = [];
                }

                let toPush = {
                  name: u.name,
                }

                if(isPresent.dataValues.country !== u.country){
                  toPush.country = u.country || isPresent.dataValues.country;
                }

                if(isPresent.dataValues[assocTable].dataValues.primary){
                  toPush[assocTable] = {primary:true};
                }
                updatedFields[old_attr_name].push(toPush);
              }
            });
          } else {
            // If there is a primary item from DB it means that has been added manually. We need to keep it

            //update with data added manually (if already in db)
            toMap = toMap.map((item)=>{
              const fromDB = old.dataValues[old_attr_name].find(
                ({ dataValues }) => dataValues.name === item.name
              );
              if(fromDB){
                if(fromDB.dataValues.date_of_birth){
                  item.date_of_birth = fromDB.dataValues.date_of_birth;
                }
                if(fromDB.dataValues.gender){
                  item.gender = fromDB.dataValues.gender;
                }

                if(fromDB.dataValues[assocTable].main){
                  item[assocTable] = {main: true};
                }
                if(fromDB.dataValues[assocTable].primary){
                  item[assocTable] = {primary: true};
                }
              }

              return item;
            });

            updatedFields[old_attr_name] = toMap;
          }
        }
      }
    }
  });
  return updatedFields;
}

function getNumber(string) {
  return parseFloat(string.replace("$", "").replace(/,/g, ""));
}

const movie_fields = [
  "id",
  "title",
  "universe_id",
  "distribution_company_id",
  "serie_id",
  "release_date",
  "budget",
  "revenue",
  "imdb_id",
  "title",
  "length",
  "overview",
  "word_count",
  "valid",
  "country",
  "poster_id",
  "deletedAt",
  "website",
];

function updateJSON(newMovie, dataFromAPIS, updates) {
  //FIXME: it breaks when autoUpdateAll --> origin:json, poster is string
  // const oldFileContent = fs.readFileSync('movies.json')
  // let jsonMovies = JSON.parse(oldFileContent)
  // let merged
  // let updatedFields
  // const oldMovie = jsonMovies.find((jm) => jm.imdb_id === newMovie.imdb_id)
  // if (oldMovie) {
  //   //remove it
  //   jsonMovies = jsonMovies.filter((jm) => jm.imdb_id !== newMovie.imdb_id)
  //   //update it
  //   if (dataFromAPIS) {
  //     getMergedMovie(newMovie, dataFromAPIS, 'db', 'api', updates)
  //   }
  //   updatedFields = getMergedMovie(oldMovie, newMovie, 'json', 'db', updates)
  //   //re add it
  //   jsonMovies.push(oldMovie)
  // }
  // if (
  //   updatedFields &&
  //   Object.keys(updatedFields).length
  //   //JSON.stringify(merged) != JSON.stringify(oldMovie)
  // ) {
  //   //save to file
  //   try {
  //     const newFileContent = JSON.stringify(jsonMovies, null, 2)
  //     fs.writeFileSync('movies.json', newFileContent, () => {
  //       console.log('movies.json has been succesfuly updated!')
  //     })
  //     return true
  //   } catch (e) {
  //     console.log('error while saving the file!!!!!!')
  //     return false
  //   }
  // } else {
  //   return false
  // }
}

module.exports = {
  movie_fields,
  getMergedMovie,
  getNumber,
  updateJSON,
};
