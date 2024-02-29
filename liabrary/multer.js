const multer = require("multer");
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads'); // Set the destination folder for uploaded files
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + file.originalname.replace(/ /g, "_")); // Set the file name
        }
    })
});

module.exports = upload