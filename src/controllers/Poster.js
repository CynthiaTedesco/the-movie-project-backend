const models = require("../../models");

function updatePoster(movie, newPoster) {
  return models.poster
    .findOne({ where: { url: newPoster.url } })
    .then((result) => {
      if (result) {
        const newPosterType =
          newPoster.poster_type_id &&
          result.poster_type_id !== newPoster.poster_type_id;
        if (newPosterType) {
          result.poster_type_id = newPoster.poster_type_id;
          return result.save();
        }
        return result;
      } else {
        //to create!
        return models.poster.create({
          url: newPoster.url,
          poster_type_id: newPoster.poster_type_id,
        });
      }
    });
}

module.exports = {
  updatePoster,
};
