/**
 * Firebase functions can require ~3-7 seconds of cold-start
 * time if unused for a while. This endpoint serves as a way
 * to reduce the amount of time that a user has to wait for a
 * search to return results.
 *
 * The `ping` endpoint is hit when the client first loads, to give
 * the functions a head start warming up before the first
 * search query.
 */
exports.ping = (req, res) => res.send();
