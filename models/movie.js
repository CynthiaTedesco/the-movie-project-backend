'use strict'
module.exports = (sequelize, DataTypes) => {
  const movie = sequelize.define(
    'movie',
    {
      awards: DataTypes.STRING,
      box_office: DataTypes.BIGINT,
      imdb_rating: DataTypes.STRING,
      imdb_id: {
        type: DataTypes.STRING,
        unique: true,
      },
      title: DataTypes.STRING,
      release_date: DataTypes.STRING,
      length: DataTypes.INTEGER,
      overview: DataTypes.TEXT,
      plot_line: DataTypes.STRING,
      budget: DataTypes.BIGINT,
      cast_quantity: DataTypes.INTEGER,
      website: DataTypes.STRING,
      word_count: DataTypes.INTEGER,
      most_used_word: DataTypes.STRING,
      revenue: DataTypes.BIGINT,
      valid: DataTypes.BOOLEAN,
      poster_id: {
        type: DataTypes.INTEGER,
        references: { model: 'posters', key: 'id' },
      },
      story_origin_id: {
        type: DataTypes.INTEGER,
        references: { model: 'story_origins', key: 'id' },
      },
      type_id: {
        type: DataTypes.INTEGER,
        references: { model: 'movie_types', key: 'id' },
      },
      set_in_place_id: {
        type: DataTypes.INTEGER,
        references: { model: 'places', key: 'id' },
      },
      set_in_time_id: {
        type: DataTypes.INTEGER,
        references: { model: 'times', key: 'id' },
      },
      universe_id: {
        type: DataTypes.INTEGER,
        references: { model: 'universes', key: 'id' },
      },
      cinematography_id: {
        type: DataTypes.INTEGER,
        references: { model: 'cinematographies', key: 'id' },
      },
      serie_id: {
        type: DataTypes.INTEGER,
        references: { model: 'series', key: 'id' },
      },
      country: DataTypes.STRING,
      deletedAt: DataTypes.DATE,
      tmdb_id: DataTypes.INTEGER,
      subtitles: {
        type: DataTypes.BLOB,
        get() {
          return this.getDataValue('subtitles') ? this.getDataValue('subtitles').toString('utf8') : '';
          // or whatever encoding is right
        },
      }
    },
    {}
  )
  movie.associate = function(models) {
    movie.belongsTo(models.poster, {
      as: 'poster',
      foreignKey: 'poster_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsTo(models.story_origin, {
      as: 'story_origin',
      foreignKey: 'story_origin_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsTo(models.movie_type, {
      as: 'type',
      foreignKey: 'type_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsTo(models.serie, {
      as: 'serie',
      foreignKey: 'serie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsTo(models.universe, {
      as: 'universe',
      foreignKey: 'universe_id',
      onDelete: 'CASCADE',
      hooks: true,
    })
    movie.belongsTo(models.cinematography, {
      as: 'cinematography',
      foreignKey: 'cinematography_id',
      onDelete: 'CASCADE',
      hooks: true,
    })
    movie.belongsTo(models.place, {
      as: 'set_in_place',
      foreignKey: 'set_in_place_id',
      onDelete: 'CASCADE',
      hooks: true,
    })
    movie.belongsTo(models.time, {
      as: 'set_in_time',
      foreignKey: 'set_in_time_id',
      onDelete: 'CASCADE',
      hooks: true
    })

    movie.belongsToMany(models.genre, {
      through: 'movies_genres',
      as: 'genres',
      foreignKey: 'movie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsToMany(models.language, {
      through: 'movies_languages',
      as: 'languages',
      foreignKey: 'movie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsToMany(models.producer, {
      through: 'movies_producers',
      as: 'producers',
      foreignKey: 'movie_id'
    })
    movie.belongsToMany(models.restriction, {
      through: 'movies_restrictions',
      as: 'restrictions',
      foreignKey: 'movie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsToMany(models.person, {
      through: 'movies_characters',
      as: 'characters',
      foreignKey: 'movie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsToMany(models.person, {
      through: 'movies_writers',
      as: 'writers',
      foreignKey: 'movie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
    movie.belongsToMany(models.person, {
      through: 'movies_directors',
      as: 'directors',
      foreignKey: 'movie_id',
      onDelete: 'CASCADE',
      hooks: true
    })
  }
  return movie
}
