const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const parseSRT = require("parse-srt");
const models = require('../../models')
const {processSubtitles} = require('../subs');

const uploadSubs = async (req, res) => {
  upload.single("subs")(req, res, (err) => {
    if (err) {
      console.log("err", err);
    }

    const fileBlob = req.file;
    models["movie"]
      .update(
        { subtitles: fileBlob.buffer },
        {
          where: {
            id: req.body.movieId,
          },
        }
      )
      .then(() => {
        models.movie
          .findOne({
            where: { id: req.body.movieId }
            // attributes: ["id", "title", "subtitles"],
          })
          .then(async (movie) => {
            const buffer = movie.dataValues.subtitles;
            const updated = processSubtitles(movie, parseSRT(buffer.toString()));

            await updated.save();
            return res.status(200).send({message: 'success', updated})
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send("Error trying to toggle validity");
      });
  });
};

module.exports = {
  uploadSubs,
};
