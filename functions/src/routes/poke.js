/**
 * Firebase functions will require ~10 seconds of cold-start
 * time if unused for a while. This endpoint serves as a way
 * to reduce the amount of time that a user has to wait for a
 * search to return results.
 *
 * The poke endpoint is hit when the client first loads, to give
 * the functions a head start warming up before the first
 * search query.
 */
exports.poke = (req, res) => res.send();
