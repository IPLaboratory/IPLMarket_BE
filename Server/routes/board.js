const router = require('express').Router();
const boardSystem = require('../services/boardSystem.js');
const likeSystem = require('../services/likeSystem.js');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

// 등록된 게시물 리스트 가져오기 요청
router.post('/boardlist', (req, res) => {
    const postData = req.body;

    console.log(postData);

    // 사용자의 ID 값이 전달 됐는지 판단 -> 전달 안됐다면 전체 게시물 리스트, 전달 됐다면 사용자가 등록한 게시물 리스트
    const getBoardList = (Object.keys(postData).length == 0)
        ? boardSystem.getBoardList()
        : boardSystem.getBoardList(postData);

    getBoardList
        .then((results) => {
            res.status(200).json(results);
        })
        .catch((error) => {
            res.status(400).json({success: false, message: 'Invalid Request'});
        })
});

// 게시물 등록 요청
router.post('/regist', (req, res) => {
    const postData = req.body;

    boardSystem.insertPost(postData)
        .then((result) => {
            res.status(201).json({success: true, message: result});
        })
        .catch((error) => {
            res.status(500).json({success: true, message: 'Error'});
        })
});


module.exports = router;