const router = require('express').Router();
const boardSystem = require('../services/boardSystem.js');
const likeSystem = require('../services/likeSystem.js');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// 좋아요 버튼 클릭 시 해당하는 요청 처리
// 한 번 더 누른 경우 취소, 처음 누른 경우 좋아요
router.post('/click', (req, res) => {
    const postNumAndId = req.body;

    likeSystem.checkLikeStatus(postNumAndId)
    .then(hasLike => {
        if (hasLike) { // 좋아요 눌러져있는 경우
            return likeSystem.deleteLike(postNumAndId);
        } else { // 좋아요 눌러져 있지 않은 경우
            return likeSystem.addLike(postNumAndId);
        }
    })
    .then(result => {
        res.status(200).json({success: true, message: "Like Processing Success"});
    })
    .catch(error => {
        res.status(400).json({success: false, message: error.message});
    })
});

module.exports = router;